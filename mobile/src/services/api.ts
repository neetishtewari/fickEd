const API_BASE = 'http://localhost:4000/api/v1';

export interface FeedPayload {
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

export interface ParentDashboardResponse {
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

// Seed Fallback Data
const seedFeedItems: FeedPayload[] = [
  {
    step_index: 1,
    total_steps: 4,
    concept: { id: 'c-01', code: 'MATH-GR5-FRAC-01', title: 'What is a Fraction?', topic: 'Fractions' },
    video: {
      id: 'vid-001',
      youtube_video_id: '3WLaDHYuOEU',
      title: 'Fractions Are Parts of a Whole',
      channel_name: 'MathAntics',
      duration_seconds: 180,
      thumbnail_url: 'https://img.youtube.com/vi/3WLaDHYuOEU/hqdefault.jpg'
    },
    questions: [{
      id: 'q-001',
      trigger_time_seconds: 180,
      question_type: 'MULTIPLE_CHOICE',
      question_text: 'What does the bottom number (denominator) of a fraction tell us?',
      options: ['How many equal parts make up a whole', 'How many parts we have eaten', 'The total cost of pizza'],
      explanation: 'The denominator shows the total number of equal slices or parts in one whole!'
    }]
  },
  {
    step_index: 2,
    total_steps: 4,
    concept: { id: 'c-02', code: 'MATH-GR5-FRAC-02', title: 'Numerator & Denominator', topic: 'Fractions' },
    video: {
      id: 'vid-002',
      youtube_video_id: 'KnP02qV4p1Q',
      title: 'Numerator and Denominator Explained',
      channel_name: 'SciShow Kids',
      duration_seconds: 210,
      thumbnail_url: 'https://img.youtube.com/vi/KnP02qV4p1Q/hqdefault.jpg'
    },
    questions: [{
      id: 'q-002',
      trigger_time_seconds: 210,
      question_type: 'MULTIPLE_CHOICE',
      question_text: 'In the fraction 3/4, which number is the numerator?',
      options: ['4', '3', '7'],
      explanation: 'The top number is the numerator! Here, 3 is the numerator.'
    }]
  }
];

export async function fetchNextFeedItem(childId: string, topic?: string): Promise<FeedPayload> {
  try {
    const url = `${API_BASE}/child/${childId}/feed/next${topic ? `?topic=${topic}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return seedFeedItems[0];
  }
}

export async function submitTelemetryEvent(
  childId: string,
  eventType: string,
  questionId?: string,
  selectedOptionIndex?: number
): Promise<TelemetryResponse> {
  try {
    const res = await fetch(`${API_BASE}/child/${childId}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        question_id: questionId,
        selected_option_index: selectedOptionIndex
      })
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    const isCorrect = selectedOptionIndex === 0;
    return {
      is_correct: isCorrect,
      xp_earned: isCorrect ? 50 : 10,
      new_total_xp: 300,
      streak_days: 4,
      concept_mastery: {
        concept_id: 'c-01',
        mastery_score: 0.85,
        status: 'MASTERED'
      }
    };
  }
}

export async function fetchParentDashboard(parentId: string): Promise<ParentDashboardResponse> {
  try {
    const res = await fetch(`${API_BASE}/parent/dashboard`, {
      headers: { 'Authorization': 'Bearer mock_jwt_token' }
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (err) {
    return {
      children: [{
        child_id: 'child-agrima-001',
        first_name: 'Agrima',
        age: 10,
        grade_level: 5,
        avatar_id: 'astronaut_cat',
        xp_points: 300,
        streak_days: 4,
        active_goal: 'Understand Fractions & Space Exploration',
        weekly_stats: {
          videos_watched: 12,
          questions_answered: 8,
          accuracy_percentage: 88,
          concepts_mastered: 3
        },
        concept_progress: [
          { concept_title: 'What is a Fraction?', topic: 'Fractions', mastery_score: 1.0, status: 'MASTERED' },
          { concept_title: 'Numerator & Denominator', topic: 'Fractions', mastery_score: 0.65, status: 'DEVELOPING' },
          { concept_title: 'Equivalent Fractions', topic: 'Fractions', mastery_score: 0.50, status: 'DEVELOPING' }
        ],
        conversation_starters: [
          { concept_title: 'Equivalent Fractions', prompt: 'Ask Agrima: "If we cut a pizza into 4 slices and eat 2, is that the exact same amount as eating half the pizza?"' },
          { concept_title: 'Solar System', prompt: 'Ask Agrima: "Can you name the massive star at the very center of our solar system?"' }
        ]
      }]
    };
  }
}
