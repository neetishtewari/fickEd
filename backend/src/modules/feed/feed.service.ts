import { query, isPostgresAvailable } from '../../db/index.js';
import { mockDb } from '../../db/mockStore.js';
import { GraphService, ConceptNode } from '../graph/graph.service.js';

export interface FeedVideoPayload {
  journey_id?: string;
  step_index: number;
  total_steps: number;
  concept: {
    id: string;
    code: string;
    title: string;
    topic: string;
  };
  video: {
    id: string;
    youtube_video_id: string;
    title: string;
    channel_name: string;
    duration_seconds: number;
    thumbnail_url: string;
  };
  questions: Array<{
    id: string;
    trigger_time_seconds: number;
    question_type: string;
    question_text: string;
    options: string[];
    explanation?: string;
  }>;
}

export class FeedService {
  static async getNextFeedItem(childId: string, topic?: string): Promise<FeedVideoPayload | null> {
    if (!isPostgresAvailable()) {
      const child = mockDb.child_profiles.find(c => c.id === childId) || mockDb.child_profiles[0];
      const targetTopic = topic || 'Fractions';

      const concepts = mockDb.concepts.filter(c => c.topic.toLowerCase().includes(targetTopic.toLowerCase()));
      const targetConcept = concepts.find(c => {
        const mastery = mockDb.child_mastery.find(m => m.child_id === child.id && m.concept_id === c.id)?.mastery_score || 0;
        return mastery < 0.80;
      }) || concepts[0] || mockDb.concepts[0];

      const matchingVideo = mockDb.videos.find(v => v.concept_id === targetConcept.id) || mockDb.videos[0];

      return {
        journey_id: 'journey-mock-001',
        step_index: 1,
        total_steps: 4,
        concept: {
          id: targetConcept.id,
          code: targetConcept.code,
          title: targetConcept.title,
          topic: targetConcept.topic,
        },
        video: {
          id: matchingVideo.id,
          youtube_video_id: matchingVideo.youtube_video_id,
          title: matchingVideo.title,
          channel_name: matchingVideo.channel_name,
          duration_seconds: matchingVideo.duration_seconds,
          thumbnail_url: matchingVideo.thumbnail_url,
        },
        questions: matchingVideo.questions.map(q => ({
          id: q.id,
          trigger_time_seconds: q.trigger_time_seconds,
          question_type: q.question_type,
          question_text: q.question_text,
          options: q.options,
          explanation: q.explanation,
        }))
      };
    }

    const childRes = await query(`
      SELECT id, age, grade_level, interests 
      FROM child_profiles 
      WHERE id = $1 AND deleted_at IS NULL;
    `, [childId]);

    if (childRes.rows.length === 0) {
      throw new Error('Child profile not found');
    }
    const child = childRes.rows[0];

    let targetConceptId: string | null = null;
    if (topic) {
      const concepts = await GraphService.searchConcepts(undefined, topic);
      if (concepts.length > 0) {
        targetConceptId = concepts[concepts.length - 1].id;
      }
    }

    if (!targetConceptId) {
      const defaultConcepts = await GraphService.searchConcepts('Mathematics', 'Fractions');
      targetConceptId = defaultConcepts.length > 0 ? defaultConcepts[defaultConcepts.length - 1].id : null;
    }

    if (!targetConceptId) return null;

    const unmasteredConcepts = await GraphService.getUnmasteredPrerequisites(targetConceptId, childId);
    const currentConcept = unmasteredConcepts[0] || (await GraphService.searchConcepts())[0];

    const videoRes = await query(`
      SELECT 
        v.id, 
        v.youtube_video_id, 
        v.title, 
        v.channel_name, 
        v.duration_seconds, 
        v.thumbnail_url, 
        v.quality_score, 
        v.safety_score,
        c.target_grade_min,
        c.target_grade_max
      FROM video_catalog v
      JOIN video_concept_mappings vcm ON v.id = vcm.video_id
      JOIN concepts c ON c.id = vcm.concept_id
      WHERE vcm.concept_id = $1 AND v.is_approved = TRUE
      ORDER BY v.quality_score DESC;
    `, [currentConcept.id]);

    if (videoRes.rows.length === 0) return null;
    const selectedVideo = videoRes.rows[0];

    const questionRes = await query(`
      SELECT id, trigger_time_seconds, question_type, question_text, options, explanation
      FROM video_questions
      WHERE video_id = $1 AND concept_id = $2
      ORDER BY trigger_time_seconds ASC;
    `, [selectedVideo.id, currentConcept.id]);

    return {
      step_index: 1,
      total_steps: unmasteredConcepts.length,
      concept: {
        id: currentConcept.id,
        code: currentConcept.code,
        title: currentConcept.title,
        topic: currentConcept.topic,
      },
      video: {
        id: selectedVideo.id,
        youtube_video_id: selectedVideo.youtube_video_id,
        title: selectedVideo.title,
        channel_name: selectedVideo.channel_name,
        duration_seconds: selectedVideo.duration_seconds,
        thumbnail_url: selectedVideo.thumbnail_url,
      },
      questions: questionRes.rows.map(q => ({
        id: q.id,
        trigger_time_seconds: q.trigger_time_seconds,
        question_type: q.question_type,
        question_text: q.question_text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        explanation: q.explanation,
      })),
    };
  }
}
