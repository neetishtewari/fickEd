export const mockDb = {
  users: [
    {
      id: 'usr-parent-001',
      email: 'parent@flicked.edu',
      password_hash: '$2a$10$w8T0J4S31E35h7A9w.L.HeFq8kS.E5vE0.wFw1/5F1cK3dE1pP1uO',
      full_name: 'Parent User',
      parent_pin_hash: '$2a$10$12341234123412341234123412341234',
      role: 'PARENT',
    }
  ],
  child_profiles: [
    {
      id: 'child-agrima-001',
      parent_id: 'usr-parent-001',
      first_name: 'Agrima',
      age: 10,
      grade_level: 5,
      avatar_id: 'astronaut_cat',
      interests: ['Space', 'Dinosaurs', 'Coding'],
      xp_points: 250,
      current_streak_days: 4,
    }
  ],
  concepts: [
    { id: 'c-frac-01', code: 'MATH-GR5-FRAC-01', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Basics', title: 'What is a Fraction?', description: 'Understanding parts of a whole', target_grade_min: 4, target_grade_max: 6 },
    { id: 'c-frac-02', code: 'MATH-GR5-FRAC-02', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Basics', title: 'Numerator and Denominator', description: 'What top and bottom numbers mean', target_grade_min: 4, target_grade_max: 6 },
    { id: 'c-frac-03', code: 'MATH-GR5-FRAC-03', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Representation', title: 'Fractions on a Number Line', description: 'Plotting fractional values visually', target_grade_min: 4, target_grade_max: 6 },
    { id: 'c-frac-04', code: 'MATH-GR5-FRAC-04', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Equivalence', title: 'Equivalent Fractions', description: 'Fractions that equal the same amount', target_grade_min: 4, target_grade_max: 6 },
    { id: 'c-frac-05', code: 'MATH-GR5-FRAC-05', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparison', title: 'Comparing Fractions', description: 'Which fraction is larger or smaller', target_grade_min: 5, target_grade_max: 7 },
    { id: 'c-space-01', code: 'SCI-GR5-SPACE-01', subject: 'Science', topic: 'Astronomy', subtopic: 'Solar System', title: 'What is the Solar System?', description: 'Overview of our cosmic neighborhood', target_grade_min: 4, target_grade_max: 6 },
  ],
  concept_prerequisites: [
    { parent_concept_id: 'c-frac-01', child_concept_id: 'c-frac-02' },
    { parent_concept_id: 'c-frac-02', child_concept_id: 'c-frac-03' },
    { parent_concept_id: 'c-frac-02', child_concept_id: 'c-frac-04' },
    { parent_concept_id: 'c-frac-03', child_concept_id: 'c-frac-05' },
    { parent_concept_id: 'c-frac-04', child_concept_id: 'c-frac-05' },
  ],
  videos: [
    {
      id: 'vid-001',
      youtube_video_id: '3WLaDHYuOEU',
      title: 'Fractions Are Parts of a Whole',
      channel_name: 'MathAntics',
      duration_seconds: 180,
      thumbnail_url: 'https://img.youtube.com/vi/3WLaDHYuOEU/hqdefault.jpg',
      quality_score: 9.5,
      safety_score: 9.8,
      concept_id: 'c-frac-01',
      questions: [
        {
          id: 'q-001',
          trigger_time_seconds: 180,
          question_type: 'MULTIPLE_CHOICE',
          question_text: 'What does the bottom number (denominator) of a fraction tell us?',
          options: ['How many equal parts make up a whole', 'How many parts we have eaten', 'The total cost of pizza'],
          correct_option_index: 0,
          explanation: 'The denominator shows the total number of equal slices or parts in one whole!'
        }
      ]
    },
    {
      id: 'vid-002',
      youtube_video_id: 'KnP02qV4p1Q',
      title: 'Numerator and Denominator Explained',
      channel_name: 'SciShow Kids',
      duration_seconds: 210,
      thumbnail_url: 'https://img.youtube.com/vi/KnP02qV4p1Q/hqdefault.jpg',
      quality_score: 9.4,
      safety_score: 9.9,
      concept_id: 'c-frac-02',
      questions: [
        {
          id: 'q-002',
          trigger_time_seconds: 210,
          question_type: 'MULTIPLE_CHOICE',
          question_text: 'In the fraction 3/4, which number is the numerator?',
          options: ['4', '3', '7'],
          correct_option_index: 1,
          explanation: 'The top number is the numerator! Here, 3 is the numerator.'
        }
      ]
    },
    {
      id: 'vid-003',
      youtube_video_id: 'vKXqzpz-G0s',
      title: 'Understanding Equivalent Fractions',
      channel_name: 'Khan Academy Kids',
      duration_seconds: 195,
      thumbnail_url: 'https://img.youtube.com/vi/vKXqzpz-G0s/hqdefault.jpg',
      quality_score: 9.7,
      safety_score: 10.0,
      concept_id: 'c-frac-04',
      questions: [
        {
          id: 'q-003',
          trigger_time_seconds: 195,
          question_type: 'MULTIPLE_CHOICE',
          question_text: 'Is 2/4 equivalent to 1/2?',
          options: ['Yes, both represent exactly half of a whole', 'No, 2/4 is twice as large', 'No, 1/2 is larger'],
          correct_option_index: 0,
          explanation: '2/4 and 1/2 cover the exact same proportion of a whole!'
        }
      ]
    },
    {
      id: 'vid-004',
      youtube_video_id: 'Qd6nLM2A8EY',
      title: 'Solar System 101 for Kids',
      channel_name: 'National Geographic Kids',
      duration_seconds: 240,
      thumbnail_url: 'https://img.youtube.com/vi/Qd6nLM2A8EY/hqdefault.jpg',
      quality_score: 9.6,
      safety_score: 9.9,
      concept_id: 'c-space-01',
      questions: [
        {
          id: 'q-004',
          trigger_time_seconds: 240,
          question_type: 'MULTIPLE_CHOICE',
          question_text: 'What star is at the center of our solar system?',
          options: ['The Sun', 'North Star', 'Alpha Centauri'],
          correct_option_index: 0,
          explanation: 'The Sun is the massive star that all planets in our solar system orbit around!'
        }
      ]
    }
  ],
  child_mastery: [
    { child_id: 'child-agrima-001', concept_id: 'c-frac-01', mastery_score: 1.00 },
    { child_id: 'child-agrima-001', concept_id: 'c-frac-02', mastery_score: 0.50 },
  ],
  telemetry_logs: [] as any[]
};
