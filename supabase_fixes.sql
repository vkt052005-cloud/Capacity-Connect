-- ==============================================================================
-- CAPACITY CONNECT: FIX ALL DATABASE RLS & SCHEMA CONFLICTS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/osahxrfvcuxymkktrbwl/sql
-- ==============================================================================

-- 1. Enable RLS and Open Full Read/Write Policies for All Application Tables
DO $$
BEGIN
    -- Courses Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Courses" ON public.courses;
        CREATE POLICY "Public Access Courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Enrollments Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
        ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Enrollments" ON public.enrollments;
        CREATE POLICY "Public Access Enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Assessments Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Assessments" ON public.assessments;
        CREATE POLICY "Public Access Assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Assessment Results / Attempts Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_results') THEN
        ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access AssessmentResults" ON public.assessment_results;
        CREATE POLICY "Public Access AssessmentResults" ON public.assessment_results FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Live Sessions Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'live_sessions') THEN
        ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access LiveSessions" ON public.live_sessions;
        CREATE POLICY "Public Access LiveSessions" ON public.live_sessions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Certificates Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificates') THEN
        ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Certificates" ON public.certificates;
        CREATE POLICY "Public Access Certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Feedbacks Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedbacks') THEN
        ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access Feedbacks" ON public.feedbacks;
        CREATE POLICY "Public Access Feedbacks" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Session Attendance Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'session_attendance') THEN
        ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access SessionAttendance" ON public.session_attendance;
        CREATE POLICY "Public Access SessionAttendance" ON public.session_attendance FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Lesson Attendance Policies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lesson_attendance') THEN
        ALTER TABLE public.lesson_attendance ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public Access LessonAttendance" ON public.lesson_attendance;
        CREATE POLICY "Public Access LessonAttendance" ON public.lesson_attendance FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 2. Convert UUID Columns to TEXT where string IDs (c-web, ls-1, etc.) are used
DO $$
BEGIN
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

-- 3. Create view/alias assessment_attempts pointing to assessment_results (ensures backward compatibility)
CREATE OR REPLACE VIEW public.assessment_attempts AS
SELECT 
    id,
    user_id AS trainee_id,
    assessment_id,
    score,
    submitted_at
FROM public.assessment_results;
