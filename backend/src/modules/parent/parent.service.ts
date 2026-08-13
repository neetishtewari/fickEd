import { query, isPostgresAvailable } from '../../db/index.js';
import { mockDb } from '../../db/mockStore.js';

export interface ParentDashboardSummary {
  children: Array<{
    child_id: string;
    first_name: string;
    age: number;
    grade_level: number;
    avatar_id: string;
    xp_points: number;
    streak_days: number;
    active_goal: string;
    weekly_stats: {
      videos_watched: number;
      questions_answered: number;
      accuracy_percentage: number;
      concepts_mastered: number;
    };
    concept_progress: Array<{
      concept_title: string;
      topic: string;
      mastery_score: number;
      status: 'MASTERED' | 'DEVELOPING' | 'NEEDS_REVIEW';
    }>;
    conversation_starters: Array<{
      concept_title: string;
      prompt: string;
    }>;
  }>;
}

export class ParentService {
  static async getDashboardSummary(parentId: string): Promise<ParentDashboardSummary> {
    if (!isPostgresAvailable()) {
      const children = mockDb.child_profiles.filter(c => c.parent_id === parentId || true);

      return {
        children: children.map(child => {
          const conceptProgress = mockDb.child_mastery.map(m => {
            const concept = mockDb.concepts.find(c => c.id === m.concept_id);
            const status = m.mastery_score >= 0.80 ? 'MASTERED' : (m.mastery_score < 0.30 ? 'NEEDS_REVIEW' : 'DEVELOPING');
            return {
              concept_title: concept ? concept.title : 'Fractions Foundations',
              topic: concept ? concept.topic : 'Fractions',
              mastery_score: m.mastery_score,
              status: status as 'MASTERED' | 'DEVELOPING' | 'NEEDS_REVIEW',
            };
          });

          const conversationStarters = conceptProgress.map(cp => ({
            concept_title: cp.concept_title,
            prompt: cp.concept_title.toLowerCase().includes('fraction')
              ? `Ask ${child.first_name}: "If we cut a pizza into 4 slices and eat 2, is that the exact same amount as eating half the pizza?"`
              : `Ask ${child.first_name} to explain what they learned about ${cp.concept_title}.`
          }));

          return {
            child_id: child.id,
            first_name: child.first_name,
            age: child.age,
            grade_level: child.grade_level,
            avatar_id: child.avatar_id,
            xp_points: child.xp_points,
            streak_days: child.current_streak_days,
            active_goal: 'Understand Fractions and Space Exploration',
            weekly_stats: {
              videos_watched: 12,
              questions_answered: 8,
              accuracy_percentage: 88,
              concepts_mastered: conceptProgress.filter(cp => cp.status === 'MASTERED').length,
            },
            concept_progress: conceptProgress,
            conversation_starters: conversationStarters,
          };
        })
      };
    }

    const childrenRes = await query(`
      SELECT id, first_name, age, grade_level, avatar_id, xp_points, current_streak_days
      FROM child_profiles
      WHERE parent_id = $1 AND deleted_at IS NULL;
    `, [parentId]);

    const childrenList = [];

    for (const child of childrenRes.rows) {
      const statsRes = await query(`
        SELECT 
          COUNT(CASE WHEN event_type = 'VIDEO_COMPLETE' THEN 1 END) AS videos_watched,
          COUNT(CASE WHEN event_type = 'QUESTION_ANSWERED' THEN 1 END) AS questions_answered,
          COUNT(CASE WHEN event_type = 'QUESTION_ANSWERED' AND is_correct = TRUE THEN 1 END) AS correct_answers
        FROM learning_event_logs
        WHERE child_id = $1 AND created_at >= NOW() - INTERVAL '7 days';
      `, [child.id]);

      const stats = statsRes.rows[0];
      const questionsAnswered = parseInt(stats.questions_answered || '0', 10);
      const correctAnswers = parseInt(stats.correct_answers || '0', 10);
      const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 100;

      const progressRes = await query(`
        SELECT c.title, c.topic, cm.mastery_score
        FROM child_concept_mastery cm
        JOIN concepts c ON c.id = cm.concept_id
        WHERE cm.child_id = $1
        ORDER BY cm.last_evaluated_at DESC
        LIMIT 5;
      `, [child.id]);

      const conceptProgress = progressRes.rows.map(r => {
        const score = parseFloat(r.mastery_score);
        const status = score >= 0.80 ? 'MASTERED' : (score < 0.30 ? 'NEEDS_REVIEW' : 'DEVELOPING');
        return {
          concept_title: r.title,
          topic: r.topic,
          mastery_score: score,
          status: status as 'MASTERED' | 'DEVELOPING' | 'NEEDS_REVIEW',
        };
      });

      const conversationStarters = conceptProgress.map(cp => {
        let prompt = `Ask ${child.first_name} to explain what they learned about ${cp.concept_title}.`;
        if (cp.concept_title.toLowerCase().includes('fraction')) {
          prompt = `Ask ${child.first_name}: "If we cut a pizza into 4 slices and eat 2, is that the exact same amount as eating half the pizza?"`;
        } else if (cp.concept_title.toLowerCase().includes('solar system')) {
          prompt = `Ask ${child.first_name}: "Can you name the massive star at the very center of our solar system?"`;
        }
        return { concept_title: cp.concept_title, prompt };
      });

      const masteredCount = conceptProgress.filter(cp => cp.status === 'MASTERED').length;

      childrenList.push({
        child_id: child.id,
        first_name: child.first_name,
        age: child.age,
        grade_level: child.grade_level,
        avatar_id: child.avatar_id,
        xp_points: child.xp_points,
        streak_days: child.current_streak_days,
        active_goal: 'Understand Fractions and Space Exploration',
        weekly_stats: {
          videos_watched: parseInt(stats.videos_watched || '0', 10),
          questions_answered: questionsAnswered,
          accuracy_percentage: accuracy,
          concepts_mastered: masteredCount,
        },
        concept_progress: conceptProgress,
        conversation_starters: conversationStarters,
      });
    }

    return { children: childrenList };
  }
}
