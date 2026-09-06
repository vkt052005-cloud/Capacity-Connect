-- ==============================================================================
-- CAPACITY CONNECT LEARNING MANAGEMENT PORTAL
-- Complete Production PostgreSQL Database Schema for Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/osahxrfvcuxymkktrbwl/sql
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('trainee', 'trainer', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
  is_verified_by_admin BOOLEAN DEFAULT FALSE,
  trainee_profile JSONB,
  trainer_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  trainer_id TEXT,
  trainer_name TEXT,
  category TEXT,
  level TEXT,
  duration TEXT,
  thumbnail TEXT,
  video_url TEXT,
  lessons JSONB DEFAULT '[]'::jsonb,
  modules JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  syllabus JSONB DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  rating NUMERIC(3, 2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY,
  trainee_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  progress INT DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. Course Feedbacks & Authentic Student Ratings Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id TEXT PRIMARY KEY,
  trainee_id TEXT NOT NULL,
  trainee_name TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  trainer_id TEXT,
  trainer_name TEXT,
  rating NUMERIC(2, 1) NOT NULL,
  comment TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  trainee_id TEXT NOT NULL,
  trainee_name TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  certificate_hash TEXT UNIQUE NOT NULL,
  grade TEXT,
  verification_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Live Sessions Table (Google Meet Integration)
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  course_title TEXT NOT NULL,
  trainer_id TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INT DEFAULT 60,
  google_meet_url TEXT,
  meeting_code TEXT,
  join_url TEXT,
  calendar_url TEXT,
  platform TEXT DEFAULT 'google-meet',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  attendee_count INT DEFAULT 0,
  attendees JSONB DEFAULT '[]'::jsonb,
  is_instant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Row-Level Security (RLS) Enablement & Open Access Policies
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Drop any previous restrictive policies if they exist
DROP POLICY IF EXISTS "Public Access Users" ON public.users;
DROP POLICY IF EXISTS "Public Access Courses" ON public.courses;
DROP POLICY IF EXISTS "Public Access Enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Public Access Feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Public Access Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public Access LiveSessions" ON public.live_sessions;

-- Create full read/write policies for the anon API key
CREATE POLICY "Public Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Feedbacks" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access LiveSessions" ON public.live_sessions FOR ALL USING (true) WITH CHECK (true);

-- 8. Enable Realtime Replication Publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.users, 
  public.courses, 
  public.enrollments, 
  public.feedbacks, 
  public.certificates, 
  public.live_sessions;

-- 9. Seed Official Verified Accounts
INSERT INTO public.users (id, name, email, password, role, status, is_verified_by_admin)
VALUES
  ('u-admin-official', 'Capacity Connect Admin', 'vkt052005@gmail.com', 'SRNNv@2005', 'admin', 'active', true),
  ('u-trainer-official', 'Raj Tiwari', 'tiwariraj052005@gmail.com', 'SRNNv@2005', 'trainer', 'active', true),
  ('u-trainer-codewithharry', 'CodeWithHarry (Haris Khan)', 'codewithharry@gmail.com', 'SRNNv@2005', 'trainer', 'active', true),
  ('u-trainee-official', 'Madhav Kumar', 't2005madhav@gmail.com', 'SRNNv@2005', 'trainee', 'active', false)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  status = EXCLUDED.status,
  is_verified_by_admin = EXCLUDED.is_verified_by_admin;
