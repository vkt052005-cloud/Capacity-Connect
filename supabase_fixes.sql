-- ==============================================================================
-- CAPACITY CONNECT: FIX ALL DATABASE RLS & SCHEMA CONFLICTS (V2 - FK SAFE)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/osahxrfvcuxymkktrbwl/sql
-- ==============================================================================

-- STEP 1: Dynamically drop all foreign key constraints on dependent tables
-- This eliminates error 42804 (incompatible types text and uuid)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
          AND table_name IN ('live_sessions', 'assessments', 'enrollments', 'assessment_results', 'certificates', 'courses')
          AND table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
    END LOOP;
END $$;

-- STEP 2: Convert UUID columns to TEXT across all tables so custom string IDs work
DO $$
BEGIN
    -- courses: id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.courses ALTER COLUMN id TYPE TEXT USING id::text;
    END IF;

    -- live_sessions: id & course_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.live_sessions ALTER COLUMN id TYPE TEXT USING id::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'course_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.live_sessions ALTER COLUMN course_id TYPE TEXT USING course_id::text;
    END IF;

    -- assessments: id & course_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.assessments ALTER COLUMN id TYPE TEXT USING id::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'course_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.assessments ALTER COLUMN course_id TYPE TEXT USING course_id::text;
    END IF;

    -- enrollments: id, user_id, course_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.enrollments ALTER COLUMN id TYPE TEXT USING id::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.enrollments ALTER COLUMN user_id TYPE TEXT USING user_id::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'course_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.enrollments ALTER COLUMN course_id TYPE TEXT USING course_id::text;
    END IF;

    -- assessment_results: id, user_id, assessment_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'id' AND data_type = 'uuid') THEN
        ALTER TABLE public.assessment_results ALTER COLUMN id TYPE TEXT USING id::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'user_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.assessment_results ALTER COLUMN user_id TYPE TEXT USING user_id::text;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_results' AND column_name = 'assessment_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.assessment_results ALTER COLUMN assessment_id TYPE TEXT USING assessment_id::text;
    END IF;
END $$;

-- STEP 3: Ensure all standard columns exist for courses and enrollments
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS trainer_name TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS lessons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS modules JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_duration_minutes INT DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 4: Enable RLS and grant open read/write policies to the public/anon API key
DO $$
BEGIN
    -- Courses
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Courses" ON public.courses;
        CREATE POLICY "Public Access Courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Enrollments
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
        ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Enrollments" ON public.enrollments;
        CREATE POLICY "Public Access Enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Assessments
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Assessments" ON public.assessments;
        CREATE POLICY "Public Access Assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Assessment Results
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_results') THEN
        ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access AssessmentResults" ON public.assessment_results;
        CREATE POLICY "Public Access AssessmentResults" ON public.assessment_results FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Live Sessions
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'live_sessions') THEN
        ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access LiveSessions" ON public.live_sessions;
        CREATE POLICY "Public Access LiveSessions" ON public.live_sessions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Certificates
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificates') THEN
        ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Certificates" ON public.certificates;
        CREATE POLICY "Public Access Certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Feedbacks
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedbacks') THEN
        ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Feedbacks" ON public.feedbacks;
        CREATE POLICY "Public Access Feedbacks" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Session Attendance
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'session_attendance') THEN
        ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access SessionAttendance" ON public.session_attendance;
        CREATE POLICY "Public Access SessionAttendance" ON public.session_attendance FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Lesson Attendance
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lesson_attendance') THEN
        ALTER TABLE public.lesson_attendance ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access LessonAttendance" ON public.lesson_attendance;
        CREATE POLICY "Public Access LessonAttendance" ON public.lesson_attendance FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- STEP 5: Create view assessment_attempts pointing to assessment_results (ensures backward compatibility)
CREATE OR REPLACE VIEW public.assessment_attempts AS
SELECT 
    id,
    user_id AS trainee_id,
    assessment_id,
    score,
    submitted_at
FROM public.assessment_results;
