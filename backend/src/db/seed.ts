import bcrypt from 'bcryptjs';
import { pool } from './index.js';

async function seedDatabase() {
  console.log('🌱 Seeding production seed dataset...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Parent User
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const pinHash = await bcrypt.hash('1234', 10);

    const userRes = await client.query(`
      INSERT INTO users (email, password_hash, full_name, parent_pin_hash, is_email_verified)
      VALUES ($1, $2, $3, $4, TRUE)
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id;
    `, ['parent@flicked.edu', passwordHash, 'Parent User', pinHash]);

    const parentId = userRes.rows[0].id;
    console.log(`  👤 Seeded Parent User (ID: ${parentId})`);

    // 2. Seed Child Profile (Agrima)
    const childRes = await client.query(`
      INSERT INTO child_profiles (parent_id, first_name, age, grade_level, avatar_id, interests, xp_points, current_streak_days)
      VALUES ($1, $2, 10, 5, 'astronaut_cat', $3, 250, 4)
      RETURNING id;
    `, [parentId, 'Agrima', ['Space', 'Dinosaurs', 'Coding']]);

    const childId = childRes.rows[0].id;
    console.log(`  👧 Seeded Child Profile "Agrima" (ID: ${childId})`);

    // 3. Seed Mathematics Concepts (Fractions Graph)
    const mathConcepts = [
      { code: 'MATH-GR5-FRAC-01', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Basics', title: 'What is a Fraction?', description: 'Understanding parts of a whole', target_grade_min: 4, target_grade_max: 6 },
      { code: 'MATH-GR5-FRAC-02', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Basics', title: 'Numerator and Denominator', description: 'What top and bottom numbers mean', target_grade_min: 4, target_grade_max: 6 },
      { code: 'MATH-GR5-FRAC-03', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Representation', title: 'Fractions on a Number Line', description: 'Plotting fractional values visually', target_grade_min: 4, target_grade_max: 6 },
      { code: 'MATH-GR5-FRAC-04', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Equivalence', title: 'Equivalent Fractions', description: 'Fractions that equal the same amount', target_grade_min: 4, target_grade_max: 6 },
      { code: 'MATH-GR5-FRAC-05', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparison', title: 'Comparing Fractions', description: 'Which fraction is larger or smaller', target_grade_min: 5, target_grade_max: 7 },
    ];

    const conceptIdMap: Record<string, string> = {};
    for (const c of mathConcepts) {
      const res = await client.query(`
        INSERT INTO concepts (code, subject, topic, subtopic, title, description, target_grade_min, target_grade_max)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title
        RETURNING id, code;
      `, [c.code, c.subject, c.topic, c.subtopic, c.title, c.description, c.target_grade_min, c.target_grade_max]);
      conceptIdMap[res.rows[0].code] = res.rows[0].id;
    }
    console.log(`  📐 Seeded 5 Mathematics Concepts`);

    // Prerequisite DAG Edges:
    // FRAC-01 -> FRAC-02
    // FRAC-02 -> FRAC-03
    // FRAC-02 -> FRAC-04
    // FRAC-03 & FRAC-04 -> FRAC-05
    const mathEdges = [
      [conceptIdMap['MATH-GR5-FRAC-01'], conceptIdMap['MATH-GR5-FRAC-02']],
      [conceptIdMap['MATH-GR5-FRAC-02'], conceptIdMap['MATH-GR5-FRAC-03']],
      [conceptIdMap['MATH-GR5-FRAC-02'], conceptIdMap['MATH-GR5-FRAC-04']],
      [conceptIdMap['MATH-GR5-FRAC-03'], conceptIdMap['MATH-GR5-FRAC-05']],
      [conceptIdMap['MATH-GR5-FRAC-04'], conceptIdMap['MATH-GR5-FRAC-05']],
    ];

    for (const [parentC, childC] of mathEdges) {
      await client.query(`
        INSERT INTO concept_prerequisites (parent_concept_id, child_concept_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [parentC, childC]);
    }
    console.log(`  🔗 Seeded Mathematics Prerequisite DAG Edges`);

    // 4. Seed Science Space Concepts
    const spaceConcepts = [
      { code: 'SCI-GR5-SPACE-01', subject: 'Science', topic: 'Astronomy', subtopic: 'Solar System', title: 'What is the Solar System?', description: 'Overview of our cosmic neighborhood', target_grade_min: 4, target_grade_max: 6 },
      { code: 'SCI-GR5-SPACE-02', subject: 'Science', topic: 'Astronomy', subtopic: 'Sun', title: 'The Power of the Sun', description: 'Star at the center of our solar system', target_grade_min: 4, target_grade_max: 6 },
      { code: 'SCI-GR5-SPACE-03', subject: 'Science', topic: 'Astronomy', subtopic: 'Planets', title: 'Inner vs Outer Planets', description: 'Rocky terrestrial vs gas giant planets', target_grade_min: 4, target_grade_max: 6 },
      { code: 'SCI-GR5-SPACE-04', subject: 'Science', topic: 'Astronomy', subtopic: 'Orbits', title: 'Why Do Planets Orbit the Sun?', description: 'Gravity and orbital velocity', target_grade_min: 5, target_grade_max: 7 },
    ];

    for (const c of spaceConcepts) {
      const res = await client.query(`
        INSERT INTO concepts (code, subject, topic, subtopic, title, description, target_grade_min, target_grade_max)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title
        RETURNING id, code;
      `, [c.code, c.subject, c.topic, c.subtopic, c.title, c.description, c.target_grade_min, c.target_grade_max]);
      conceptIdMap[res.rows[0].code] = res.rows[0].id;
    }

    const spaceEdges = [
      [conceptIdMap['SCI-GR5-SPACE-01'], conceptIdMap['SCI-GR5-SPACE-02']],
      [conceptIdMap['SCI-GR5-SPACE-01'], conceptIdMap['SCI-GR5-SPACE-03']],
      [conceptIdMap['SCI-GR5-SPACE-02'], conceptIdMap['SCI-GR5-SPACE-04']],
    ];

    for (const [parentC, childC] of spaceEdges) {
      await client.query(`
        INSERT INTO concept_prerequisites (parent_concept_id, child_concept_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [parentC, childC]);
    }
    console.log(`  🪐 Seeded 4 Science Astronomy Concepts & DAG Edges`);

    // 5. Seed Trusted Videos
    const videos = [
      {
        youtube_video_id: 'N1-eN_j8YxQ',
        title: 'Fractions for Kids - MathAntics',
        channel_name: 'MathAntics',
        channel_id: 'UC4a-Gbdw7vOaccHmFo40b9g',
        duration_seconds: 180,
        thumbnail_url: 'https://img.youtube.com/vi/N1-eN_j8YxQ/hqdefault.jpg',
        safety_score: 9.8,
        quality_score: 9.5,
        concept_code: 'MATH-GR5-FRAC-01',
        question: {
          text: 'What does the bottom number (denominator) of a fraction tell us?',
          options: ['How many equal parts make up a whole', 'How many parts we have eaten', 'The total cost of pizza'],
          correct: 0,
          explanation: 'The denominator shows the total number of equal slices or parts in one whole!'
        }
      },
      {
        youtube_video_id: 'p33BYV1UXDA',
        title: 'Numerator and Denominator Explained',
        channel_name: 'SciShow Kids',
        channel_id: 'UCib8Z5b7B8-zKLtda05tH1w',
        duration_seconds: 210,
        thumbnail_url: 'https://img.youtube.com/vi/p33BYV1UXDA/hqdefault.jpg',
        safety_score: 9.9,
        quality_score: 9.4,
        concept_code: 'MATH-GR5-FRAC-02',
        question: {
          text: 'In the fraction 3/4, which number is the numerator?',
          options: ['4', '3', '7'],
          correct: 1,
          explanation: 'The top number is the numerator! Here, 3 is the numerator.'
        }
      },
      {
        youtube_video_id: 'qcHHhd6HizI',
        title: 'Equivalent Fractions - Khan Academy Kids',
        channel_name: 'Khan Academy Kids',
        channel_id: 'UCb292y_W4Mh9p17eF17eMzA',
        duration_seconds: 195,
        thumbnail_url: 'https://img.youtube.com/vi/qcHHhd6HizI/hqdefault.jpg',
        safety_score: 10.0,
        quality_score: 9.7,
        concept_code: 'MATH-GR5-FRAC-04',
        question: {
          text: 'Is 2/4 equivalent to 1/2?',
          options: ['Yes, both represent exactly half of a whole', 'No, 2/4 is twice as large', 'No, 1/2 is larger'],
          correct: 0,
          explanation: '2/4 and 1/2 cover the exact same proportion of a whole!'
        }
      },
      {
        youtube_video_id: 'libKVRa074s',
        title: 'Tour the Solar System - CrashCourse Kids',
        channel_name: 'CrashCourse Kids',
        channel_id: 'UC7DdEm33SyaTDtWYGO2CwdA',
        duration_seconds: 240,
        thumbnail_url: 'https://img.youtube.com/vi/libKVRa074s/hqdefault.jpg',
        safety_score: 9.9,
        quality_score: 9.6,
        concept_code: 'SCI-GR5-SPACE-01',
        question: {
          text: 'What star is at the center of our solar system?',
          options: ['The Sun', 'North Star', 'Alpha Centauri'],
          correct: 0,
          explanation: 'The Sun is the massive star that all planets in our solar system orbit around!'
        }
      },
      {
        youtube_video_id: 't-kzdR93bqw',
        title: 'Inner vs Outer Planets - National Geographic Kids',
        channel_name: 'NatGeoKids',
        channel_id: 'UCXVCgPdnv6H5zup-Z1nNnpA',
        duration_seconds: 220,
        thumbnail_url: 'https://img.youtube.com/vi/t-kzdR93bqw/hqdefault.jpg',
        safety_score: 9.8,
        quality_score: 9.5,
        concept_code: 'SCI-GR5-SPACE-03',
        question: {
          text: 'Which planet is an inner, rocky planet?',
          options: ['Jupiter', 'Earth', 'Neptune'],
          correct: 1,
          explanation: 'Earth is one of the four inner terrestrial rocky planets (Mercury, Venus, Earth, Mars).'
        }
      }
    ];

    for (const v of videos) {
      const vidRes = await client.query(`
        INSERT INTO video_catalog (youtube_video_id, title, channel_name, channel_id, duration_seconds, thumbnail_url, safety_score, quality_score, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        ON CONFLICT (youtube_video_id) DO UPDATE SET title = EXCLUDED.title
        RETURNING id;
      `, [v.youtube_video_id, v.title, v.channel_name, v.channel_id, v.duration_seconds, v.thumbnail_url, v.safety_score, v.quality_score]);

      const videoId = vidRes.rows[0].id;
      const conceptId = conceptIdMap[v.concept_code];

      if (conceptId) {
        await client.query(`
          INSERT INTO video_concept_mappings (video_id, concept_id, relevance_score, difficulty)
          VALUES ($1, $2, 0.95, 'BEGINNER')
          ON CONFLICT DO NOTHING;
        `, [videoId, conceptId]);

        await client.query(`
          INSERT INTO video_questions (video_id, concept_id, trigger_time_seconds, question_type, question_text, options, correct_option_index, explanation)
          VALUES ($1, $2, $3, 'MULTIPLE_CHOICE', $4, $5, $6, $7)
          ON CONFLICT DO NOTHING;
        `, [videoId, conceptId, v.duration_seconds, v.question.text, JSON.stringify(v.question.options), v.question.correct, v.question.explanation]);
      }
    }
    console.log(`  🎬 Seeded ${videos.length} Approved Videos with Active Recall Questions`);

    // 6. Seed Initial Mastery Data for Agrima
    // Agrima has completed MATH-GR5-FRAC-01 (Mastery 1.0) and is working on MATH-GR5-FRAC-02 (Mastery 0.5)
    await client.query(`
      INSERT INTO child_concept_mastery (child_id, concept_id, mastery_score, videos_watched_count, questions_attempted_count, questions_correct_count)
      VALUES 
        ($1, $2, 1.00, 2, 2, 2),
        ($1, $3, 0.50, 1, 1, 0)
      ON CONFLICT DO NOTHING;
    `, [childId, conceptIdMap['MATH-GR5-FRAC-01'], conceptIdMap['MATH-GR5-FRAC-02']]);

    console.log(`  ⭐ Seeded Initial Concept Mastery for Agrima`);

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
