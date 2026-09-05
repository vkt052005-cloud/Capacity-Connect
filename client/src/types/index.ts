export interface User {
  id: string;
  email: string;
  name: string;
  name_hi?: string;
  role: 'trainee' | 'trainer' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  institute_id?: string;
  cadre?: string;
  experience_years?: number;
  qualifications?: string;
  research_interests?: string;
  competency_tags?: string[];
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Institute {
  id: string;
  name: string;
  name_hi?: string;
  code: string;
  location?: string;
  type?: string;
}

export interface Course {
  id: string;
  title: string;
  title_hi?: string;
  description: string;
  description_hi?: string;
  domain: string;
  institute_id: string;
  institute_name?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  delivery_mode: 'online' | 'offline' | 'hybrid';
  duration_hours: number;
  trainer_id: string;
  trainer_name?: string;
  batch_code: string;
  start_date: string;
  end_date: string;
  max_capacity: number;
  enrollment_count?: number;
  status: string;
  created_at?: string;
}

export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  title_hi?: string;
  time_limit_minutes: number;
  passing_score: number;
  total_marks: number;
  deadline?: string;
  questions?: Question[];
  created_by: string;
  created_at?: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_text_hi?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  marks: number;
  sort_order: number;
}

export interface Submission {
  id: string;
  assessment_id: string;
  user_id: string;
  user_name?: string;
  answers: Record<string, string>;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds: number;
  submitted_at: string;
}

export interface Resource {
  id: string;
  course_id: string;
  title: string;
  title_hi?: string;
  type: 'video' | 'pdf' | 'dataset' | 'manual';
  url: string;
  description?: string;
  uploaded_by: string;
  created_at?: string;
}

export interface Certificate {
  id: string;
  cert_code: string;
  user_id: string;
  course_id: string;
  user_name: string;
  course_title: string;
  institute_name: string;
  issue_date: string;
  qr_data?: string;
  created_at?: string;
}

export interface Feedback {
  id: string;
  course_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  title_hi?: string;
  content: string;
  content_hi?: string;
  type: string;
  is_active: boolean;
  created_at?: string;
}

export interface Analytics {
  totalUsers: number;
  totalTrainees: number;
  totalTrainers: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  instituteStats: { institute: string; count: number }[];
}

export interface CompetencyTag {
  id: string;
  name: string;
  name_hi?: string;
  domain: string;
}
