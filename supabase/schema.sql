-- ==============================================================================
-- CAPACITY CONNECT LEARNING MANAGEMENT PORTAL
-- Production PostgreSQL Database Schema for Supabase
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('trainee', 'trainer', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
  trainee_profile JSONB,
  trainer_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  trainer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  category TEXT,
  level TEXT,
  modules JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INT DEFAULT 30,
  passing_score INT DEFAULT 70,
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Submissions & Exam Logs Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assessment_id TEXT REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  tab_switch_count INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Cryptographically Signed Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  grade TEXT NOT NULL,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  verification_hash TEXT NOT NULL,
  verification_url TEXT NOT NULL
);

-- 6. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical'))
);

-- 7. Enable Realtime Replication for Users & Certificates
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;

-- 8. Seed Initial Accounts
INSERT INTO public.users (id, name, email, password, role, status)
VALUES
  ('u-admin-1', 'Global Capacity Admin', 'admin@capacityconnect.org', 'Admin@123', 'admin', 'active'),
  ('u-trainer-1', 'Dr. Marcus Vance', 'trainer@capacityconnect.org', 'Trainer@123', 'trainer', 'active'),
  ('u-trainee-1', 'Vikash Tiwari', 'trainee@capacityconnect.org', 'Trainee@123', 'trainee', 'active')
ON CONFLICT (email) DO NOTHING;
