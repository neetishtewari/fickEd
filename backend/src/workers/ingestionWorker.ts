import { query, isPostgresAvailable } from '../db/index.js';
import { mockDb } from '../db/mockStore.js';
import { LLMEnrichmentService } from '../services/llmEnrichment.service.js';

export interface TrustedChannel {
  id: string;
  name: string;
  subject: string;
}

export const TRUSTED_CREATORS: TrustedChannel[] = [
  { id: 'UC4a-Gbdw7vOaccHmFo40b9g', name: 'MathAntics', subject: 'Mathematics' },
  { id: 'UCib8Z5b7B8-zKLtda05tH1w', name: 'SciShow Kids', subject: 'Science' },
  { id: 'UC7DdEm33SyaTDtWYGO2CwdA', name: 'CrashCourse Kids', subject: 'Science' },
  { id: 'UCb292y_W4Mh9p17eF17eMzA', name: 'Khan Academy Kids', subject: 'Mathematics' },
  { id: 'UCXVCgPdnv6H5zup-Z1nNnpA', name: 'National Geographic Kids', subject: 'Science' },
  { id: 'UCsooa4yRKGN_zEE8iknghZA', name: 'TED-Ed', subject: 'Interdisciplinary' },
];

export interface CandidateVideoPayload {
  youtube_video_id: string;
  title: string;
  channel_name: string;
  channel_id: string;
  duration_seconds: number;
  thumbnail_url: string;
  raw_transcript: string;
  description: string;
}

export class IngestionWorker {
  /**
   * Main ingestion entry point: ingests and enriches a batch of YouTube videos.
   */
  static async processVideoBatch(candidates: CandidateVideoPayload[]): Promise<{
    processed: number;
    approved: number;
    rejected: number;
  }> {
    console.log(`📡 [INGESTION WORKER] Processing batch of ${candidates.length} candidate videos...`);

    // Fetch available concepts for mapping
    let availableConcepts: Array<{ id: string; code: string; title: string; topic: string }> = [];

    if (isPostgresAvailable()) {
      const conceptsRes = await query(`SELECT id, code, title, topic FROM concepts;`);
      availableConcepts = conceptsRes.rows;
    } else {
      availableConcepts = mockDb.concepts.map(c => ({ id: c.id, code: c.code, title: c.title, topic: c.topic }));
    }

    let approvedCount = 0;
    let rejectedCount = 0;

    for (const candidate of candidates) {
      console.log(`  🎬 Analyzing: "${candidate.title}" (${candidate.channel_name})`);

      // Run Gemini LLM / NLP Enrichment Pipeline
      const enrichment = await LLMEnrichmentService.enrichVideoContent(
        candidate.title,
        candidate.description,
        candidate.raw_transcript,
        candidate.duration_seconds,
        availableConcepts
      );

      if (!enrichment.is_approved) {
        console.warn(`  ⛔ [REJECTED] "${candidate.title}" failed safety/quality checks (Safety Score: ${enrichment.safety_score})`);
        rejectedCount++;
        continue;
      }

      console.log(`  ✅ [APPROVED] Safety Score: ${enrichment.safety_score} | Target Concept: ${enrichment.target_concept_code}`);
      approvedCount++;

      // Save to database or Mock Store
      if (isPostgresAvailable()) {
        await this.saveToPostgres(candidate, enrichment, availableConcepts);
      } else {
        this.saveToMockDb(candidate, enrichment, availableConcepts);
      }
    }

    console.log(`🎉 [INGESTION BATCH COMPLETE] Processed: ${candidates.length} | Approved: ${approvedCount} | Rejected: ${rejectedCount}`);
    return { processed: candidates.length, approved: approvedCount, rejected: rejectedCount };
  }

  private static async saveToPostgres(
    candidate: CandidateVideoPayload,
    enrichment: any,
    availableConcepts: any[]
  ) {
    const targetConcept = availableConcepts.find(c => c.code === enrichment.target_concept_code) || availableConcepts[0];

    // 1. Save video catalog item
    const vidRes = await query(`
      INSERT INTO video_catalog (youtube_video_id, title, channel_name, channel_id, duration_seconds, thumbnail_url, safety_score, quality_score, is_approved, raw_transcript)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9)
      ON CONFLICT (youtube_video_id) DO UPDATE SET 
        safety_score = EXCLUDED.safety_score, 
        quality_score = EXCLUDED.quality_score
      RETURNING id;
    `, [
      candidate.youtube_video_id,
      candidate.title,
      candidate.channel_name,
      candidate.channel_id,
      candidate.duration_seconds,
      candidate.thumbnail_url,
      enrichment.safety_score,
      enrichment.quality_score,
      candidate.raw_transcript
    ]);

    const videoId = vidRes.rows[0].id;

    // 2. Save video concept mapping
    await query(`
      INSERT INTO video_concept_mappings (video_id, concept_id, relevance_score, difficulty)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING;
    `, [videoId, targetConcept.id, enrichment.relevance_score, enrichment.difficulty]);

    // 3. Save generated active recall questions
    for (const q of enrichment.questions) {
      await query(`
        INSERT INTO video_questions (video_id, concept_id, trigger_time_seconds, question_type, question_text, options, correct_option_index, explanation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING;
      `, [
        videoId,
        targetConcept.id,
        q.trigger_time_seconds,
        q.question_type,
        q.question_text,
        JSON.stringify(q.options),
        q.correct_option_index,
        q.explanation
      ]);
    }
  }

  private static saveToMockDb(
    candidate: CandidateVideoPayload,
    enrichment: any,
    availableConcepts: any[]
  ) {
    const targetConcept = availableConcepts.find(c => c.code === enrichment.target_concept_code) || availableConcepts[0];
    const newVidId = `vid-${Date.now()}`;

    mockDb.videos.push({
      id: newVidId,
      youtube_video_id: candidate.youtube_video_id,
      title: candidate.title,
      channel_name: candidate.channel_name,
      duration_seconds: candidate.duration_seconds,
      thumbnail_url: candidate.thumbnail_url,
      quality_score: enrichment.quality_score,
      safety_score: enrichment.safety_score,
      concept_id: targetConcept.id,
      questions: enrichment.questions.map((q: any, idx: number) => ({
        id: `q-ingest-${idx}-${Date.now()}`,
        trigger_time_seconds: q.trigger_time_seconds,
        question_type: q.question_type,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index,
        explanation: q.explanation,
      }))
    });
  }
}
