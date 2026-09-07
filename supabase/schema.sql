-- ============================================================
-- Capacity Connect — Full Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── Core Tables ─────────────────────────────────────────────

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password text,
  role text not null default 'trainee',
  status text not null default 'pending',
  created_at timestamptz default now(),
  phone text,
  department text,
  designation text,
  is_verified_by_admin boolean default false,
  trainee_profile jsonb,
  trainer_profile jsonb,
  removed_at timestamptz,
  removed_by text,
  removal_reason text
);

create table if not exists courses (
  id text primary key,
  title text not null,
  description text,
  trainer_id text,
  trainer_name text,
  category text,
  thumbnail text,
  duration text,
  level text,
  status text default 'active',
  created_at timestamptz default now(),
  resources jsonb default '[]',
  tags jsonb default '[]',
  rating numeric default 0,
  total_ratings integer default 0,
  syllabus jsonb,
  prerequisites jsonb,
  lessons jsonb default '[]',
  modules jsonb
);

create table if not exists enrollments (
  id text primary key,
  trainee_id text not null,
  course_id text not null,
  enrolled_at timestamptz default now(),
  progress integer default 0,
  completed_at timestamptz,
  feedback_id text
);

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
  is_instant boolean default false
);

create table if not exists assessments (
  id text primary key,
  course_id text not null,
  course_title text,
  title text not null,
  description text,
  deadline timestamptz,
  duration_minutes integer,
  questions jsonb default '[]',
  created_by text,
  created_at timestamptz default now(),
  passing_score numeric default 70
);

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

-- ─── Attendance Tables ────────────────────────────────────────

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

-- ─── Row Level Security ───────────────────────────────────────

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

-- Drop existing policies first (safe to re-run)
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

-- Create open policies
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