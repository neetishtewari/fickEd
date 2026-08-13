-- Initial Production DDL for FlickEd Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PARENT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'PREDICTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journey_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'PAUSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table (Parents)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    parent_pin_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'PARENT',
    is_email_verified BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Child Profiles Table
CREATE TABLE IF NOT EXISTS child_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age BETWEEN 5 AND 17),
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 0 AND 12),
    avatar_id VARCHAR(50) DEFAULT 'default_avatar',
    interests TEXT[] DEFAULT '{}',
    xp_points INT DEFAULT 0,
    current_streak_days INT DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Concepts Table (Learning Graph Nodes)
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    subtopic VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_grade_min INT NOT NULL,
    target_grade_max INT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Concept Prerequisites Table (Learning Graph Edges)
CREATE TABLE IF NOT EXISTS concept_prerequisites (
    parent_concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    child_concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_concept_id, child_concept_id),
    CONSTRAINT no_self_loop CHECK (parent_concept_id <> child_concept_id)
);

-- 5. Video Catalog Table
CREATE TABLE IF NOT EXISTS video_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    channel_name VARCHAR(150) NOT NULL,
    channel_id VARCHAR(100) NOT NULL,
    duration_seconds INT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    safety_score NUMERIC(3, 2) CHECK (safety_score BETWEEN 0 AND 10),
    quality_score NUMERIC(3, 2) CHECK (quality_score BETWEEN 0 AND 10),
    is_approved BOOLEAN DEFAULT FALSE,
    raw_transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Video Concept Mappings
CREATE TABLE IF NOT EXISTS video_concept_mappings (
    video_id UUID NOT NULL REFERENCES video_catalog(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relevance_score NUMERIC(3, 2) CHECK (relevance_score BETWEEN 0 AND 1),
    difficulty difficulty_level DEFAULT 'BEGINNER',
    PRIMARY KEY (video_id, concept_id)
);

-- 7. Active Recall Questions Table
CREATE TABLE IF NOT EXISTS video_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES video_catalog(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    trigger_time_seconds INT DEFAULT 0,
    question_type question_type DEFAULT 'MULTIPLE_CHOICE',
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Child Concept Mastery Table
CREATE TABLE IF NOT EXISTS child_concept_mastery (
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_score NUMERIC(3, 2) DEFAULT 0.00 CHECK (mastery_score BETWEEN 0 AND 1),
    videos_watched_count INT DEFAULT 0,
    questions_attempted_count INT DEFAULT 0,
    questions_correct_count INT DEFAULT 0,
    last_evaluated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (child_id, concept_id)
);

-- 9. Learning Journeys Table
CREATE TABLE IF NOT EXISTS learning_journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    goal_concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    status journey_status DEFAULT 'IN_PROGRESS',
    current_step_index INT DEFAULT 0,
    total_steps_count INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Partitioned Telemetry Event Logs Table
CREATE TABLE IF NOT EXISTS learning_event_logs (
    id UUID DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES video_catalog(id),
    question_id UUID REFERENCES video_questions(id),
    event_type VARCHAR(50) NOT NULL,
    watch_time_seconds INT DEFAULT 0,
    user_answer_index INT,
    is_correct BOOLEAN,
    idempotency_key VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partition Tables for 2026
CREATE TABLE IF NOT EXISTS learning_event_logs_2026_08 PARTITION OF learning_event_logs
    FOR VALUES FROM ('2026-08-01 00:00:00+00') TO ('2026-09-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS learning_event_logs_2026_09 PARTITION OF learning_event_logs
    FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS learning_event_logs_2026_10 PARTITION OF learning_event_logs
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON child_profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_concepts_subject_topic ON concepts(subject, topic);
CREATE INDEX IF NOT EXISTS idx_video_catalog_approved ON video_catalog(is_approved, safety_score) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_event_logs_child_time ON learning_event_logs(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_logs_idempotency ON learning_event_logs(idempotency_key) WHERE idempotency_key IS NOT NULL;
