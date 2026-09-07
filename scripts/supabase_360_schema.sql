-- ============================================================
-- Capacity Connect — Complete 360 Production Schema & Migration
-- Covers all 16 collections, RLS security policies,
-- Realtime streaming publications, and Storage bucket policies.
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
  status text not null default 'active',
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

-- ─── 11. ASSESSMENT ATTEMPTS TABLE ───────────────────────────
create table if not exists assessment_attempts (
  id text primary key,
  assessment_id text not null,
  trainee_id text not null,
  trainee_name text,
  score numeric not null default 0,
  percentage numeric not null default 0,
  passed boolean default false,
  answers jsonb default '{}',
  submitted_at timestamptz default now()
);

-- ─── 12. SUBJECT COMPETENCIES TABLE ──────────────────────────
create table if not exists subject_competencies (
  id text primary key,
  subject text not null,
  category text,
  organizational_demand_score numeric default 0,
  internal_capacity_score numeric default 0,
  gap_score numeric default 0,
  priority text default 'Medium',
  suitable_trainers jsonb default '[]',
  created_at timestamptz default now()
);

-- ─── 13. LEADERBOARD TABLE ───────────────────────────────────
create table if not exists leaderboard (
  id text primary key,
  name text not null,
  department text,
  xp integer default 0,
  streak integer default 0,
  courses_completed integer default 0,
  rank integer default 0,
  avatar_url text,
  updated_at timestamptz default now()
);

-- ─── 14. BADGES TABLE ────────────────────────────────────────
create table if not exists badges (
  id text primary key,
  name text not null,
  description text,
  icon text,
  category text,
  created_at timestamptz default now()
);

-- ─── 15. DISCUSSION THREADS TABLE ────────────────────────────
create table if not exists discussion_threads (
  id text primary key,
  course_id text not null,
  title text not null,
  content text,
  author_id text not null,
  author_name text,
  author_role text,
  author_avatar text,
  upvotes integer default 0,
  upvoted_by jsonb default '[]',
  replies jsonb default '[]',
  created_at timestamptz default now()
);

-- ─── 16. ROW LEVEL SECURITY & OPEN POLICIES ──────────────────
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
alter table assessment_attempts enable row level security;
alter table subject_competencies enable row level security;
alter table leaderboard enable row level security;
alter table badges enable row level security;
alter table discussion_threads enable row level security;

-- Drop existing policies if any
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
drop policy if exists "allow_all_assessment_attempts" on assessment_attempts;
drop policy if exists "allow_all_subject_competencies" on subject_competencies;
drop policy if exists "allow_all_leaderboard" on leaderboard;
drop policy if exists "allow_all_badges" on badges;
drop policy if exists "allow_all_discussion_threads" on discussion_threads;

-- Create open policies for all 16 tables
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
create policy "allow_all_assessment_attempts" on assessment_attempts for all to anon, authenticated using (true) with check (true);
create policy "allow_all_subject_competencies" on subject_competencies for all to anon, authenticated using (true) with check (true);
create policy "allow_all_leaderboard" on leaderboard for all to anon, authenticated using (true) with check (true);
create policy "allow_all_badges" on badges for all to anon, authenticated using (true) with check (true);
create policy "allow_all_discussion_threads" on discussion_threads for all to anon, authenticated using (true) with check (true);

-- ─── 17. SUPABASE REALTIME REPLICATION ───────────────────────
do $$
begin
  begin alter publication supabase_realtime add table users; exception when others then null; end;
  begin alter publication supabase_realtime add table courses; exception when others then null; end;
  begin alter publication supabase_realtime add table assessments; exception when others then null; end;
  begin alter publication supabase_realtime add table enrollments; exception when others then null; end;
  begin alter publication supabase_realtime add table certificates; exception when others then null; end;
  begin alter publication supabase_realtime add table live_sessions; exception when others then null; end;
  begin alter publication supabase_realtime add table feedbacks; exception when others then null; end;
  begin alter publication supabase_realtime add table notifications; exception when others then null; end;
  begin alter publication supabase_realtime add table session_attendance; exception when others then null; end;
  begin alter publication supabase_realtime add table lesson_attendance; exception when others then null; end;
  begin alter publication supabase_realtime add table audit_logs; exception when others then null; end;
  begin alter publication supabase_realtime add table assessment_attempts; exception when others then null; end;
  begin alter publication supabase_realtime add table subject_competencies; exception when others then null; end;
  begin alter publication supabase_realtime add table leaderboard; exception when others then null; end;
  begin alter publication supabase_realtime add table badges; exception when others then null; end;
  begin alter publication supabase_realtime add table discussion_threads; exception when others then null; end;
end $$;

-- ─── 18. SUPABASE STORAGE: VIDEOS BUCKET & POLICIES ──────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('videos', 'videos', true, 524288000)
on conflict (id) do update set public = true;

drop policy if exists "public_select_videos" on storage.objects;
drop policy if exists "public_insert_videos" on storage.objects;
drop policy if exists "public_update_videos" on storage.objects;
drop policy if exists "public_delete_videos" on storage.objects;

create policy "public_select_videos" on storage.objects for select to anon, authenticated using (bucket_id = 'videos');
create policy "public_insert_videos" on storage.objects for insert to anon, authenticated using (bucket_id = 'videos') with check (bucket_id = 'videos');
create policy "public_update_videos" on storage.objects for update to anon, authenticated using (bucket_id = 'videos') with check (bucket_id = 'videos');
create policy "public_delete_videos" on storage.objects for delete to anon, authenticated using (bucket_id = 'videos');
