// ─── User & Role Types ────────────────────────────────────────────────────────
export type UserRole = "trainee" | "trainer" | "admin";
export type UserStatus = "pending" | "active" | "inactive" | "suspended" | "rejected";

export interface TraineeProfile {
  qualifications: string[];
  experience: string[];
  skills: string[];
  interests: string[];
  certificates: Certificate[];
  bio: string;
  phone: string;
  department: string;
  designation: string;
  avatarUrl?: string;
  xpPoints: number;
  streakDays: number;
  completedCoursesCount: number;
  badges: Badge[];
}

export interface TrainerProfile {
  bio: string;
  expertise: string[];
  competencies: string[];
  phone: string;
  department: string;
  designation: string;
  experience: string;
  avatarUrl?: string;
  rating: number;
  totalStudentsTaught: number;
  verifiedCredentials: string[];
  isVerifiedByAdmin?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  phone?: string;
  department?: string;
  designation?: string;
  isVerifiedByAdmin?: boolean;
  traineeProfile?: TraineeProfile;
  trainerProfile?: TrainerProfile;
}

// ─── Gamification & Badges ──────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "achievement" | "milestone" | "mastery";
  earnedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string;
  department: string;
  xp: number;
  streak: number;
  coursesCompleted: number;
  rank: number;
}

// ─── Course & Content Types ──────────────────────────────────────────────────
export type CourseCategory = "Technical" | "Leadership" | "Communication" | "Compliance" | "Soft Skills" | "Domain" | "AI & Data";
export type CourseStatus = "active" | "draft" | "archived";
export type ResourceType = "video" | "pdf" | "presentation" | "document" | "link";

export interface SlideItem {
  slideNumber: number;
  title: string;
  bullets: string[];
  keyConcept: string;
  diagramUrl?: string;
  notes?: string;
}

export interface TranscriptItem {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface Resource {
  id: string;
  courseId: string;
  title: string;
  type: ResourceType;
  url: string;
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  version?: string;
  slides?: SlideItem[];
  transcripts?: TranscriptItem[];
  summary?: string;
  keyTakeaways?: string[];
  flashcards?: Flashcard[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  trainerId: string;
  trainerName: string;
  category: CourseCategory;
  thumbnail: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  status: CourseStatus;
  createdAt: string;
  resources: Resource[];
  tags: string[];
  rating?: number;
  totalRatings?: number;
  syllabus?: string[];
  prerequisites?: string[];
  videoUrl?: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  lessonNumber: number;
  title: string;
  duration: string;
  youtubeUrl: string;
  videoId: string;
  videoSource?: "youtube" | "url" | "file";
  description?: string;
}

export interface Enrollment {
  id: string;
  traineeId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  completedAt?: string;
  feedbackId?: string;
}

// ─── Live Session & Google Meet Types ──────────────────────────────────────
export interface LiveSession {
  id: string;
  courseId: string;
  courseTitle: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  googleMeetUrl?: string;
  meetingCode?: string;
  zoomMeetingId?: string; // legacy fallback
  passcode?: string;
  joinUrl: string;
  platform?: "google-meet" | "in-app" | "zoom";
  status: "upcoming" | "live" | "completed" | "cancelled";
  attendeeCount: number;
  attendees?: string[];
  calendarUrl?: string;
  isInstant?: boolean;
}

// ─── Assessment & Proctoring Types ──────────────────────────────────────────
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctIndex?: number;
  answerHash?: string;
  points: number;
  explanation?: string;
  topic?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  deadline: string;
  durationMinutes: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  passingScore: number;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  traineeId: string;
  answers: number[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  timeTakenSeconds: number;
  tabSwitchCount?: number;
  proctorLogs?: string[];
}

// ─── Certificate Types ───────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseTitle: string;
  trainerName: string;
  issuedAt: string;
  certificateHash: string;
  grade?: string;
  verificationUrl?: string;
}

// ─── Course Discussion & Peer Q&A ───────────────────────────────────────────
export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isTrainerVerified?: boolean;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  replies: DiscussionReply[];
}

// ─── Feedback & Review ──────────────────────────────────────────────────────
export interface Feedback {
  id: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
  tags?: string[];
}

// ─── Announcement & Notification Types ──────────────────────────────────────
export type NotificationType = "announcement" | "achievement" | "new_content" | "alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
  author: string;
  link?: string;
}

// ─── Competency Mapping Types (Core USP) ────────────────────────────────────
export interface SubjectCompetency {
  subject: string;
  category: CourseCategory;
  organizationalDemandScore: number;
  internalCapacityScore: number;
  gapScore: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  suitableTrainers: {
    id: string;
    name: string;
    rating: number;
    matchPercentage: number;
    experienceYears: number;
    competencies: string[];
  }[];
}

// ─── Audit Log Types ────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  ipAddress?: string;
}
