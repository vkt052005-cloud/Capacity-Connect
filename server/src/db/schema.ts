import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

export const initializeDatabase = (): Database.Database => {
  if (db) return db;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'capacity-connect.db');
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      name_hi TEXT,
      role TEXT CHECK(role IN ('trainee','trainer','admin')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      institute_id TEXT,
      cadre TEXT,
      experience_years INTEGER,
      qualifications TEXT,
      research_interests TEXT,
      competency_tags TEXT,
      bio TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS institutes (
      id TEXT PRIMARY KEY,
      name TEXT,
      name_hi TEXT,
      code TEXT UNIQUE,
      location TEXT,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT,
      title_hi TEXT,
      description TEXT,
      description_hi TEXT,
      domain TEXT,
      institute_id TEXT REFERENCES institutes(id),
      level TEXT CHECK(level IN ('beginner','intermediate','advanced')),
      delivery_mode TEXT CHECK(delivery_mode IN ('online','offline','hybrid')),
      duration_hours INTEGER,
      trainer_id TEXT REFERENCES users(id),
      batch_code TEXT,
      start_date TEXT,
      end_date TEXT,
      max_capacity INTEGER DEFAULT 50,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      course_id TEXT REFERENCES courses(id),
      status TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled','completed','dropped')),
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id),
      title TEXT,
      title_hi TEXT,
      time_limit_minutes INTEGER DEFAULT 30,
      passing_score INTEGER DEFAULT 60,
      total_marks INTEGER,
      deadline TEXT,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT REFERENCES assessments(id),
      question_text TEXT,
      question_text_hi TEXT,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_option TEXT CHECK(correct_option IN ('A','B','C','D')),
      marks INTEGER DEFAULT 1,
      sort_order INTEGER
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT REFERENCES assessments(id),
      user_id TEXT REFERENCES users(id),
      answers TEXT,
      score INTEGER,
      total_marks INTEGER,
      percentage REAL,
      passed INTEGER,
      time_taken_seconds INTEGER,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id),
      title TEXT,
      title_hi TEXT,
      type TEXT CHECK(type IN ('video','pdf','dataset','manual')),
      url TEXT,
      description TEXT,
      uploaded_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      cert_code TEXT UNIQUE,
      user_id TEXT REFERENCES users(id),
      course_id TEXT REFERENCES courses(id),
      user_name TEXT,
      course_title TEXT,
      institute_name TEXT,
      issue_date TEXT,
      qr_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id),
      user_id TEXT REFERENCES users(id),
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT,
      title_hi TEXT,
      content TEXT,
      content_hi TEXT,
      type TEXT DEFAULT 'notice',
      is_active INTEGER DEFAULT 1,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competencies (
      id TEXT PRIMARY KEY,
      name TEXT,
      name_hi TEXT,
      domain TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS user_competencies (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      competency_id TEXT REFERENCES competencies(id),
      proficiency_level INTEGER CHECK(proficiency_level BETWEEN 1 AND 5),
      verified INTEGER DEFAULT 0
    );
  `);

  return db;
};

export const getDb = (): Database.Database => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};
