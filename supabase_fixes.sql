-- ==============================================================================
-- CAPACITY CONNECT: FIX ALL DATABASE RLS & SCHEMA CONFLICTS (V4 - ALL IDs TEXT)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/osahxrfvcuxymkktrbwl/sql
-- ==============================================================================

-- 1. Convert trainer_id in courses and live_sessions to TEXT
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'trainer_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.courses ALTER COLUMN trainer_id TYPE TEXT USING trainer_id::text;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'trainer_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.live_sessions ALTER COLUMN trainer_id TYPE TEXT USING trainer_id::text;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'trainer_id' AND data_type = 'uuid') THEN
        ALTER TABLE public.assessments ALTER COLUMN trainer_id TYPE TEXT USING trainer_id::text;
    END IF;
END $$;
