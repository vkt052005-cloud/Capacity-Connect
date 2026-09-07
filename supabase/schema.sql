-- ============================================================
-- Capacity Connect — Complete Production Schema & Migration
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── 1. USERS TABLE ──────────────────────────────────────────
create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password text,
  role text not null default 'trainee',
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table users add column if not exists phone text;
alter table users add column if not exists department text;
alter table users add column if not exists designation text;
alter table users add column if not exists is_verified_by_admin boolean default false;
alter table users add column if not exists trainee_profile jsonb;
alter table users add column if not exists trainer_profile jsonb;
alter table users add column if not exists removed_at timestamptz;
alter table users add column if not exists removed_by text;
alter table users add column if not exists removal_reason text;

-- ─── 2. COURSES TABLE ────────────────────────────────────────
create table if not exists courses (
  id text primary key,
  title text not null,
  description text,
  trainer_id text,
  created_at timestamptz default now()
);

alter table courses add column if not exists trainer_name text;
alter table courses add column if not exists category text;
alter table courses add column if not exists thumbnail text;
alter table courses add column if not exists duration text;
alter table courses add column if not exists level text;
alter table courses add column if not exists status text default 'active';
alter table courses add column if not exists resources jsonb default '[]';
alter table courses add column if not exists tags jsonb default '[]';
alter table courses add column if not exists rating numeric default 0;
alter table courses add column if not exists total_ratings integer default 0;
alter table courses add column if not exists syllabus jsonb;
alter table courses add column if not exists prerequisites jsonb;
alter table courses add column if not exists lessons jsonb default '[]';
alter table courses add column if not exists modules jsonb;

-- ─── 3. ASSESSMENTS TABLE ────────────────────────────────────
create table if not exists assessments (
  id text primary key,
  course_id text not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);

alter table assessments add column if not exists course_title text;
alter table assessments add column if not exists duration_minutes integer default 30;
alter table assessments add column if not exists time_limit_minutes integer default 30;
alter table assessments add column if not exists deadline timestamptz;
alter table assessments add column if not exists questions jsonb default '[]';
alter table assessments add column if not exists created_by text;
alter table assessments add column if not exists passing_score numeric default 70;

-- ─── 4. ENROLLMENTS TABLE ────────────────────────────────────
create table if not exists enrollments (
  id text primary key,
  trainee_id text not null,
  course_id text not null,
  enrolled_at timestamptz default now(),
  progress integer default 0,
  completed_at timestamptz,
  feedback_id text
);

-- ─── 5. CERTIFICATES TABLE ───────────────────────────────────
create table if not exists certificates (
  id text primary key,
  trainee_id text not null,
  trainee_name text,
  course_id text not null,
  course_title text,
  trainer_name text,
  issued_at timestamptz default now(),
  certificate_hash text,
  grade text,
  verification_url text
);

-- ─── 6. LIVE SESSIONS TABLE ──────────────────────────────────
create table if not exists live_sessions (
  id text primary key,
  course_id text,
  course_title text,
  trainer_id text not null,
  trainer_name text,
  title text not null,
  description text,
  scheduled_at timestamptz,
  duration_minutes integer default 60,
  google_meet_url text,
  meeting_code text,
  join_url text,
  platform text default 'google-meet',
  status text default 'upcoming',
  attendee_count integer default 0,
  attendees jsonb default '[]',
  calendar_url text,
  is_instant boolean default false,
  created_at timestamptz default now()
);

-- ─── 7. FEEDBACKS TABLE ──────────────────────────────────────
create table if not exists feedbacks (
  id text primary key,
  trainee_id text not null,
  trainee_name text,
  course_id text not null,
  course_title text,
  trainer_id text,
  trainer_name text,
  rating numeric not null,
  comment text,
  created_at timestamptz default now(),
  tags jsonb
);

-- ─── 8. NOTIFICATIONS TABLE ──────────────────────────────────
create table if not exists notifications (
  id text primary key,
  type text not null,
  title text not null,
  content text,
  created_at timestamptz default now(),
  pinned boolean default false,
  author text,
  link text
);

-- ─── 9. ATTENDANCE TABLES ────────────────────────────────────
create table if not exists session_attendance (
  id text primary key,
  session_id text not null,
  session_title text,
  course_id text,
  course_title text,
  trainee_id text not null,
  trainee_name text,
  trainer_id text,
  trainer_name text,
  joined_at timestamptz default now(),
  left_at timestamptz,
  duration_minutes integer default 0,
  status text default 'present'
);

create table if not exists lesson_attendance (
  id text primary key,
  course_id text not null,
  course_title text,
  lesson_id text not null,
  lesson_title text,
  trainee_id text not null,
  trainee_name text,
  trainer_id text,
  trainer_name text,
  watched_at timestamptz default now(),
  watch_duration_seconds integer default 0,
  completion_percent integer default 0,
  status text default 'partial'
);

-- ─── 10. AUDIT LOGS TABLE ────────────────────────────────────
create table if not exists audit_logs (
  id text primary key,
  timestamp timestamptz default now(),
  actor text,
  role text,
  action text,
  target text,
  status text,
  ip_address text
);

-- ─── 11. ROW LEVEL SECURITY & OPEN POLICIES ──────────────────
alter table users enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table feedbacks enable row level security;
alter table certificates enable row level security;
alter table live_sessions enable row level security;
alter table assessments enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table session_attendance enable row level security;
alter table lesson_attendance enable row level security;

drop policy if exists "allow_all_users" on users;
drop policy if exists "allow_all_courses" on courses;
drop policy if exists "allow_all_enrollments" on enrollments;
drop policy if exists "allow_all_feedbacks" on feedbacks;
drop policy if exists "allow_all_certificates" on certificates;
drop policy if exists "allow_all_live_sessions" on live_sessions;
drop policy if exists "allow_all_assessments" on assessments;
drop policy if exists "allow_all_notifications" on notifications;
drop policy if exists "allow_all_audit_logs" on audit_logs;
drop policy if exists "allow_all_session_attendance" on session_attendance;
drop policy if exists "allow_all_lesson_attendance" on lesson_attendance;

create policy "allow_all_users" on users for all to anon, authenticated using (true) with check (true);
create policy "allow_all_courses" on courses for all to anon, authenticated using (true) with check (true);
create policy "allow_all_enrollments" on enrollments for all to anon, authenticated using (true) with check (true);
create policy "allow_all_feedbacks" on feedbacks for all to anon, authenticated using (true) with check (true);
create policy "allow_all_certificates" on certificates for all to anon, authenticated using (true) with check (true);
create policy "allow_all_live_sessions" on live_sessions for all to anon, authenticated using (true) with check (true);
create policy "allow_all_assessments" on assessments for all to anon, authenticated using (true) with check (true);
create policy "allow_all_notifications" on notifications for all to anon, authenticated using (true) with check (true);
create policy "allow_all_audit_logs" on audit_logs for all to anon, authenticated using (true) with check (true);
create policy "allow_all_session_attendance" on session_attendance for all to anon, authenticated using (true) with check (true);
create policy "allow_all_lesson_attendance" on lesson_attendance for all to anon, authenticated using (true) with check (true);
