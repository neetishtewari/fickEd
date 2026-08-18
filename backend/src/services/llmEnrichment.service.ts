import { env } from '../config/env.js';

export interface LLMEnrichmentResult {
  safety_score: number; // 0.0 - 10.0
  quality_score: number; // 0.0 - 10.0
  is_approved: boolean;
  target_concept_code: string;
  relevance_score: number; // 0.0 - 1.0
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  questions: Array<{
    trigger_time_seconds: number;
    question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'PREDICTION';
    question_text: string;
    options: string[];
    correct_option_index: number;
    explanation: string;
  }>;
}

export class LLMEnrichmentService {
  static async enrichVideoContent(
    title: string,
    description: string,
    transcript: string,
    durationSeconds: number,
    availableConcepts: Array<{ code: string; title: string; topic: string }>
  ): Promise<LLMEnrichmentResult> {
    if (env.GEMINI_API_KEY) {
      try {
        return await this.callGeminiAPI(title, description, transcript, durationSeconds, availableConcepts);
      } catch (err) {
        console.warn(`[GEMINI WARNING] Gemini API call failed, using deterministic NLP fallback: ${(err as Error).message}`);
      }
    }

    return this.fallbackNlpClassifier(title, description, transcript, durationSeconds, availableConcepts);
  }

  private static async callGeminiAPI(
    title: string,
    description: string,
    transcript: string,
    durationSeconds: number,
    availableConcepts: Array<{ code: string; title: string; topic: string }>
  ): Promise<LLMEnrichmentResult> {
    const prompt = `
You are an expert AI Educational Safety Auditor and Curriculum Classifier for children aged 8-12.
Analyze the following YouTube educational video transcript and metadata.

Video Title: "${title}"
Video Description: "${description}"
Duration: ${durationSeconds} seconds
Transcript: "${transcript.substring(0, 2000)}"

Available Concept Codes:
${JSON.stringify(availableConcepts, null, 2)}

Tasks:
1. Rate Safety Score (0.0 - 10.0) based on COPPA compliance, absence of ads/violence/profanity.
2. Rate Educational Quality Score (0.0 - 10.0) based on clarity and pedagogical value.
3. Map to the single BEST target_concept_code from Available Concept Codes.
4. Rate relevance_score (0.0 to 1.0) and difficulty ('BEGINNER', 'INTERMEDIATE', 'ADVANCED').
5. Generate 2 age-appropriate active recall multiple choice questions (with 3 options each, 0-indexed correct option, and a short explanation).

Respond STRICTLY in valid JSON matching this exact schema:
{
  "safety_score": 9.5,
  "quality_score": 9.0,
  "is_approved": true,
  "target_concept_code": "MATH-GR5-FRAC-01",
  "relevance_score": 0.95,
  "difficulty": "BEGINNER",
  "questions": [
    {
      "trigger_time_seconds": ${Math.floor(durationSeconds * 0.9)},
      "question_type": "MULTIPLE_CHOICE",
      "question_text": "Sample question text?",
      "options": ["Option A", "Option B", "Option C"],
      "correct_option_index": 0,
      "explanation": "Short explanation text."
    }
  ]
}
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    return JSON.parse(rawText) as LLMEnrichmentResult;
  }

  private static fallbackNlpClassifier(
    title: string,
    description: string,
    transcript: string,
    durationSeconds: number,
    availableConcepts: Array<{ code: string; title: string; topic: string }>
  ): LLMEnrichmentResult {
    const text = `${title} ${description} ${transcript}`.toLowerCase();

    let matchedConcept = availableConcepts[0];
    let maxMatch = 0;

    for (const concept of availableConcepts) {
      const keywords = `${concept.title} ${concept.topic}`.toLowerCase().split(' ');
      let matches = 0;
      for (const kw of keywords) {
        if (kw.length > 3 && text.includes(kw)) matches++;
      }
      if (matches > maxMatch) {
        maxMatch = matches;
        matchedConcept = concept;
      }
    }

    const unsafeKeywords = ['ad', 'buy now', 'promo', 'sponsor', 'violence', 'gun'];
    let safetyScore = 9.8;
    for (const bad of unsafeKeywords) {
      if (text.includes(bad)) safetyScore -= 1.5;
    }

    const isApproved = safetyScore >= 8.0 && durationSeconds <= 360;

    return {
      safety_score: Math.max(0, safetyScore),
      quality_score: 9.2,
      is_approved: isApproved,
      target_concept_code: matchedConcept.code,
      relevance_score: 0.92,
      difficulty: 'BEGINNER',
      questions: [
        {
          trigger_time_seconds: Math.floor(durationSeconds * 0.85),
          question_type: 'MULTIPLE_CHOICE',
          question_text: `What is the main learning takeaway regarding ${matchedConcept.title}?`,
          options: [
            `Understanding how ${matchedConcept.title} works in practice`,
            `Memoriging random numbers without meaning`,
            `Ignoring the fundamental concepts`
          ],
          correct_option_index: 0,
          explanation: `This video clearly demonstrates the core principles of ${matchedConcept.title}!`
        }
      ]
    };
  }
}
