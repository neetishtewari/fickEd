import { query, isPostgresAvailable } from '../../db/index.js';
import { mockDb } from '../../db/mockStore.js';

export interface TelemetryEventDto {
  childId: string;
  videoId?: string;
  questionId?: string;
  conceptId?: string;
  eventType: 'VIDEO_START' | 'VIDEO_PROGRESS' | 'VIDEO_COMPLETE' | 'QUESTION_ANSWERED' | 'SKIP';
  watchTimeSeconds?: number;
  selectedOptionIndex?: number;
  idempotencyKey?: string;
}

export interface TelemetryResponse {
  is_correct?: boolean;
  xp_earned: number;
  new_total_xp: number;
  streak_days: number;
  concept_mastery?: {
    concept_id: string;
    mastery_score: number;
    status: 'DEVELOPING' | 'MASTERED' | 'NEEDS_REVIEW';
  };
}

export class TelemetryService {
  static async recordEvent(event: TelemetryEventDto): Promise<TelemetryResponse> {
    if (!isPostgresAvailable()) {
      let isCorrect: boolean | undefined = undefined;
      let xpEarned = 0;

      if (event.questionId) {
        let question: any = null;
        for (const v of mockDb.videos) {
          const q = v.questions.find(q => q.id === event.questionId);
          if (q) { question = q; break; }
        }

        if (question) {
          isCorrect = event.selectedOptionIndex === question.correct_option_index;
          xpEarned = isCorrect ? 50 : 10;
        }
      } else if (event.eventType === 'VIDEO_COMPLETE') {
        xpEarned = 25;
      }

      const child = mockDb.child_profiles.find(c => c.id === event.childId) || mockDb.child_profiles[0];
      child.xp_points += xpEarned;

      let targetConceptId = event.conceptId || 'c-frac-02';
      let masteryObj = mockDb.child_mastery.find(m => m.child_id === child.id && m.concept_id === targetConceptId);
      let currentMastery = masteryObj ? masteryObj.mastery_score : 0.5;

      if (isCorrect === true) currentMastery = Math.min(1.0, currentMastery + 0.35);
      if (isCorrect === false) currentMastery = Math.max(0.0, currentMastery - 0.15);
      if (event.eventType === 'VIDEO_COMPLETE') currentMastery = Math.min(1.0, currentMastery + 0.25);

      if (masteryObj) {
        masteryObj.mastery_score = currentMastery;
      } else {
        mockDb.child_mastery.push({ child_id: child.id, concept_id: targetConceptId, mastery_score: currentMastery });
      }

      const status = currentMastery >= 0.80 ? 'MASTERED' : (currentMastery < 0.30 ? 'NEEDS_REVIEW' : 'DEVELOPING');

      return {
        is_correct: isCorrect,
        xp_earned: xpEarned,
        new_total_xp: child.xp_points,
        streak_days: child.current_streak_days,
        concept_mastery: {
          concept_id: targetConceptId,
          mastery_score: currentMastery,
          status,
        }
      };
    }

    await query(`
      INSERT INTO learning_event_logs (child_id, video_id, question_id, event_type, watch_time_seconds, user_answer_index, is_correct, idempotency_key)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [
      event.childId,
      event.videoId || null,
      event.questionId || null,
      event.eventType,
      event.watchTimeSeconds || 0,
      event.selectedOptionIndex !== undefined ? event.selectedOptionIndex : null,
      null,
      event.idempotencyKey || null,
    ]);

    let xpEarned = 0;
    let isCorrect: boolean | undefined = undefined;
    let targetConceptId = event.conceptId;

    if (event.questionId) {
      const qRes = await query(`
        SELECT concept_id, correct_option_index 
        FROM video_questions 
        WHERE id = $1;
      `, [event.questionId]);

      if (qRes.rows.length > 0) {
        const question = qRes.rows[0];
        targetConceptId = targetConceptId || question.concept_id;
        isCorrect = event.selectedOptionIndex === question.correct_option_index;

        await query(`
          UPDATE learning_event_logs 
          SET is_correct = $1 
          WHERE child_id = $2 AND question_id = $3 AND event_type = 'QUESTION_ANSWERED';
        `, [isCorrect, event.childId, event.questionId]);

        xpEarned = isCorrect ? 50 : 10;
      }
    } else if (event.eventType === 'VIDEO_COMPLETE') {
      xpEarned = 25;
    }

    const childRes = await query(`
      UPDATE child_profiles 
      SET xp_points = xp_points + $1, last_active_at = NOW()
      WHERE id = $2
      RETURNING xp_points, current_streak_days;
    `, [xpEarned, event.childId]);

    const updatedChild = childRes.rows[0];
    let masteryStatus: 'DEVELOPING' | 'MASTERED' | 'NEEDS_REVIEW' = 'DEVELOPING';
    let currentMasteryScore = 0.0;

    if (targetConceptId) {
      const masteryRes = await query(`
        SELECT mastery_score, videos_watched_count, questions_attempted_count, questions_correct_count
        FROM child_concept_mastery
        WHERE child_id = $1 AND concept_id = $2;
      `, [event.childId, targetConceptId]);

      let oldScore = 0.0;
      let watched = 0;
      let attempted = 0;
      let correct = 0;

      if (masteryRes.rows.length > 0) {
        oldScore = parseFloat(masteryRes.rows[0].mastery_score);
        watched = masteryRes.rows[0].videos_watched_count;
        attempted = masteryRes.rows[0].questions_attempted_count;
        correct = masteryRes.rows[0].questions_correct_count;
      }

      if (event.eventType === 'VIDEO_COMPLETE') watched += 1;
      if (isCorrect !== undefined) {
        attempted += 1;
        if (isCorrect) correct += 1;
      }

      let delta = 0.0;
      if (event.eventType === 'VIDEO_COMPLETE') delta += 0.25;
      if (isCorrect === true) delta += 0.35;
      if (isCorrect === false) delta -= 0.15;

      currentMasteryScore = Math.min(1.0, Math.max(0.0, oldScore + delta));
      masteryStatus = currentMasteryScore >= 0.80 ? 'MASTERED' : (currentMasteryScore < 0.30 ? 'NEEDS_REVIEW' : 'DEVELOPING');

      await query(`
        INSERT INTO child_concept_mastery (child_id, concept_id, mastery_score, videos_watched_count, questions_attempted_count, questions_correct_count, last_evaluated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (child_id, concept_id) DO UPDATE SET
          mastery_score = EXCLUDED.mastery_score,
          videos_watched_count = EXCLUDED.videos_watched_count,
          questions_attempted_count = EXCLUDED.questions_attempted_count,
          questions_correct_count = EXCLUDED.questions_correct_count,
          last_evaluated_at = NOW();
      `, [event.childId, targetConceptId, currentMasteryScore, watched, attempted, correct]);
    }

    return {
      is_correct: isCorrect,
      xp_earned: xpEarned,
      new_total_xp: updatedChild ? updatedChild.xp_points : 0,
      streak_days: updatedChild ? updatedChild.current_streak_days : 0,
      concept_mastery: targetConceptId ? {
        concept_id: targetConceptId,
        mastery_score: currentMasteryScore,
        status: masteryStatus,
      } : undefined,
    };
  }
}
