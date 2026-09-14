import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Video, Presentation, Sparkles, MessageSquare, Award,
  CheckCircle2, AlertTriangle, ListVideo, Search, ChevronLeft,
  ChevronRight, Play, ExternalLink, Star, LogOut, BookOpen,
  FolderOpen, Download, FileText, Radio, ShieldCheck, Clock, Calendar, Plus
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { AdaptiveVideoPlayer } from "../../components/video/AdaptiveVideoPlayer";
import { SlideDeckViewer } from "../../components/video/SlideDeckViewer";
import { AiCourseSummarizer } from "../../components/ai/AiCourseSummarizer";
import { AiDoubtSolverChat } from "../../components/ai/AiDoubtSolverChat";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { isStudentEnrolledInTeacherCourse } from "../../utils/liveMeetEnrollment";
import { initialDiscussions, initialCourses } from "../../data/seed";
import { sigmaWebDevLessons } from "../../data/sigmaWebDevPlaylist";
import { dsaLessons } from "../../data/dsaPlaylist";
import { sqlLessons } from "../../data/sqlPlaylist";
import { cLessons } from "../../data/cPlaylist";
import { pythonLessons } from "../../data/pythonPlaylist";
import { cppDsaLessons } from "../../data/cppDsaPlaylist";
import { dbmsLessons } from "../../data/dbmsPlaylist";
import { cnLessons } from "../../data/cnPlaylist";
import { daaLessons } from "../../data/daaPlaylist";
import { seLessons } from "../../data/sePlaylist";
import { getCourseThumbnail } from "../../utils/courseThumbnail";

const WEBDEV_MODULE_FILTERS = [
  { label: "All (139)", start: 1, end: 139 },
  { label: "HTML5 (1-13)", start: 1, end: 13 },
  { label: "CSS3 & Layouts (14-53)", start: 14, end: 53 },
  { label: "JavaScript ES6+ (54-84)", start: 54, end: 84 },
  { label: "Node & Express (85-93)", start: 85, end: 93 },
  { label: "MongoDB & Database (94-97)", start: 94, end: 97 },
  { label: "Tailwind CSS & Projects (98-104)", start: 98, end: 104 },
  { label: "React.js Complete (105-120)", start: 105, end: 120 },
  { label: "Next.js 15 & Fullstack (121-139)", start: 121, end: 139 }
];

const DSA_MODULE_FILTERS = [
  { label: "All (315)", start: 1, end: 315 },
  { label: "Basics, STL & Arrays (1-44)", start: 1, end: 44 },
  { label: "Binary Search (45-76)", start: 45, end: 76 },
  { label: "Binary Trees & BST (77-125)", start: 77, end: 125 },
  { label: "Graphs (126-181)", start: 126, end: 181 },
  { label: "Dynamic Programming (182-236)", start: 182, end: 236 },
  { label: "Linked Lists (237-296)", start: 237, end: 296 },
  { label: "Stacks, Queues & Caches (297-315)", start: 297, end: 315 }
];

const SQL_MODULE_FILTERS = [
  { label: "All (16)", start: 1, end: 16 },
  { label: "Core Lectures (1-8)", start: 1, end: 8 },
  { label: "Deep Dive Modules (9-16)", start: 9, end: 16 },
  { label: "Querying & Relating (2-3)", start: 2, end: 3 },
  { label: "Design & Writing (4-5)", start: 4, end: 5 },
  { label: "Optimization & Scaling (6-8)", start: 6, end: 8 }
];

const C_MODULE_FILTERS = [
  { label: "All (14)", start: 1, end: 14 },
  { label: "Variables & Operators (1-2)", start: 1, end: 2 },
  { label: "Conditionals & Loops (3-4)", start: 3, end: 4 },
  { label: "Functions & Pointers (5-6)", start: 5, end: 6 },
  { label: "Arrays & Strings (7-8)", start: 7, end: 8 },
  { label: "Structures & File I/O (9-10)", start: 9, end: 10 },
  { label: "Dynamic Memory & Projects (11-14)", start: 11, end: 14 }
];

const PYTHON_MODULE_FILTERS = [
  { label: "All (100)", start: 1, end: 100 },
  { label: "Days 1-20 (Fundamentals)", start: 1, end: 20 },
  { label: "Days 21-40 (Collections & Files)", start: 21, end: 40 },
  { label: "Days 41-60 (OOP Principles)", start: 41, end: 60 },
  { label: "Days 61-80 (Advanced Python)", start: 61, end: 80 },
  { label: "Days 81-100 (Projects & GUI)", start: 81, end: 100 }
];

const CPP_DSA_MODULE_FILTERS = [
  { label: "All (100)", start: 1, end: 100 },
  { label: "Foundations & STL (1-25)", start: 1, end: 25 },
  { label: "Sorting & Searching (26-45)", start: 26, end: 45 },
  { label: "Recursion & Backtracking (46-60)", start: 46, end: 60 },
  { label: "Linked Lists & Stacks (61-80)", start: 61, end: 80 },
  { label: "Trees, Graphs & DP (81-100)", start: 81, end: 100 }
];

const DBMS_MODULE_FILTERS = [
  { label: "All (91)", start: 1, end: 91 },
  { label: "Basics & ER Model (1-18)", start: 1, end: 18 },
  { label: "Relational Algebra (19-35)", start: 1, end: 35 },
  { label: "SQL & Normalization (36-60)", start: 36, end: 60 },
  { label: "Transactions & Concurrency (61-78)", start: 61, end: 78 },
  { label: "Recovery & Deadlocks (79-91)", start: 79, end: 91 }
];

const CN_MODULE_FILTERS = [
  { label: "All (100)", start: 1, end: 100 },
  { label: "OSI & Physical Layer (1-20)", start: 1, end: 20 },
  { label: "Data Link Layer & Framing (21-45)", start: 21, end: 45 },
  { label: "Network Layer & Subnetting (46-70)", start: 46, end: 70 },
  { label: "Transport Layer & TCP (71-88)", start: 71, end: 88 },
  { label: "Application Layer & Security (89-100)", start: 89, end: 100 }
];

const DAA_MODULE_FILTERS = [
  { label: "All (10)", start: 1, end: 10 },
  { label: "Asymptotic & Master Theorem (1-2)", start: 1, end: 2 },
  { label: "Divide & Conquer (3)", start: 3, end: 3 },
  { label: "Greedy Algorithms (4)", start: 4, end: 4 },
  { label: "Dynamic Programming (5)", start: 5, end: 5 },
  { label: "Backtracking & Branch Bound (6-7)", start: 6, end: 7 },
  { label: "String Matching & NP-Complete (8-10)", start: 8, end: 10 }
];

const SE_MODULE_FILTERS = [
  { label: "All (60)", start: 1, end: 60 },
  { label: "SDLC & Process Models (1-12)", start: 1, end: 12 },
  { label: "Requirements & Metrics (13-24)", start: 1, end: 24 },
  { label: "Software Design & UML (25-36)", start: 25, end: 36 },
  { label: "Software Testing (37-48)", start: 37, end: 48 },
  { label: "Reliability & Maintenance (49-60)", start: 49, end: 60 }
];

const COURSE_ASSESSMENT_MAP: Record<string, string> = {
  "c6": "a-webdev-sigma",
  "c-dsa": "a-dsa-striver",
  "c-sql": "a-sql-cs50",
  "c-c-prog": "a-c-prog",
  "c-python": "a-python-100",
  "c-cpp-dsa": "a-cpp-dsa",
  "c-dbms": "a-dbms-neso",
  "c-cn": "a-cn-gate",
  "c-daa": "a-daa-kg",
  "c-se": "a-se-iit"
};

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, enrollments, enroll, unenroll, completeCourse, feedbacks } = useCoursesStore();
  const { sessions, launchGoogleMeet, openClassroom } = useLiveSessionsStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const { markLessonWatched } = useAttendanceStore();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"video" | "slides" | "resources" | "ai" | "discussions" | "reviews" | "live">("video");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [lessonSearch, setLessonSearch] = useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>("");

  const isEnrolled = Boolean(
    currentUser &&
    currentUser.role === "trainee" &&
    (enrollments.some(
      (e) => (e.traineeId === currentUser.id || (e as any).userId === currentUser.id) && e.courseId === id
    ) ||
      Boolean((currentUser.traineeProfile as any)?.enrolledCourses?.includes(id)) ||
      Boolean((currentUser.traineeProfile as any)?.enrolled_courses?.includes(id)))
  );

  const handleUnenrollCourse = () => {
    if (!currentUser || !id) return;
    if (window.confirm(`Are you sure you want to unenroll from "${course?.title || "this course"}"?`)) {
      unenroll(currentUser.id, id);
      addToast({
        title: "Unenrolled from Course",
        message: `You have been unenrolled from ${course?.title || "the course"}.`,
        type: "info"
      });
      navigate("/trainee/dashboard");
    }
  };

  // Ensure course is accurately resolved: first check user courses store, then seed courses
  const course = courses.find((c) => c.id === id) || initialCourses.find((c) => c.id === id);

  const isBuiltInSeedCourse = Boolean(
    id &&
    ["c6", "c-dsa", "c-sql", "c-c-prog", "c-python", "c-cpp-dsa", "c-dbms", "c-cn", "c-daa", "c-se"].includes(id)
  );

  const currentModuleFilters = useMemo(() => {
    const courseId = course?.id || id || "";
    const title = (course?.title || "").toLowerCase();

    if (courseId === "c-c-prog" || title.includes("c programming")) return C_MODULE_FILTERS;
    if (courseId === "c-python" || title.includes("python")) return PYTHON_MODULE_FILTERS;
    if (courseId === "c-cpp-dsa" || (title.includes("c++") && title.includes("dsa"))) return CPP_DSA_MODULE_FILTERS;
    if (courseId === "c-dbms" || title.includes("dbms")) return DBMS_MODULE_FILTERS;
    if (courseId === "c-cn" || title.includes("computer network") || title.includes("network")) return CN_MODULE_FILTERS;
    if (courseId === "c-daa" || title.includes("daa") || title.includes("analysis of algorithm")) return DAA_MODULE_FILTERS;
    if (courseId === "c-se" || title.includes("software engineering")) return SE_MODULE_FILTERS;
    if (courseId === "c-sql" || title.includes("sql") || title.includes("database")) return SQL_MODULE_FILTERS;
    if (courseId === "c-dsa" || title.includes("data structure")) return DSA_MODULE_FILTERS;
    if (courseId === "c6" || title.includes("web development")) return WEBDEV_MODULE_FILTERS;

    // For custom mentor courses: provide dynamic module filters based on actual lessons
    return [{ label: "All Lessons", start: 1, end: 9999 }];
  }, [course, id]);

  const activeModuleFilter = selectedModuleFilter && currentModuleFilters.some(m => m.label === selectedModuleFilter)
    ? selectedModuleFilter
    : currentModuleFilters[0].label;

  const [discussions, setDiscussions] = useState(
    initialDiscussions.filter((d) => d.courseId === id || d.courseId === course?.id || (!id && d.courseId === "c6"))
  );
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionTitle, setNewQuestionTitle] = useState("");

  // Ensure lessons match the course: if mentor uploaded lessons, ALWAYS prioritize them
  const allLessons = useMemo(() => {
    if (course?.lessons && course.lessons.length > 0) {
      return course.lessons;
    }
    const courseId = course?.id || id || "";
    if (courseId === "c-c-prog") return cLessons;
    if (courseId === "c-python") return pythonLessons;
    if (courseId === "c-cpp-dsa") return cppDsaLessons;
    if (courseId === "c-dbms") return dbmsLessons;
    if (courseId === "c-cn") return cnLessons;
    if (courseId === "c-daa") return daaLessons;
    if (courseId === "c-se") return seLessons;
    if (courseId === "c-sql") return sqlLessons;
    if (courseId === "c-dsa") return dsaLessons;
    if (courseId === "c6") return sigmaWebDevLessons;

    const seedMatch = initialCourses.find((c) => c.id === courseId);
    if (seedMatch?.lessons && seedMatch.lessons.length > 0) {
      return seedMatch.lessons;
    }
    // For custom courses that haven't uploaded lessons yet, return empty list instead of hijack
    return [];
  }, [course, id]);

  if (!course) {
    return (
      <DashboardLayout
        pageTitle="Course Not Found"
        breadcrumbs={[
          { label: "Courses", to: "/courses" },
          { label: "Not Found" }
        ]}
      >
        <div className="max-w-md mx-auto my-16 p-8 glass-panel border border-white/15 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Course Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested course could not be located in the curriculum catalog.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="apple-btn-primary text-xs px-5 py-2.5 font-bold mx-auto flex items-center gap-2 cursor-pointer"
          >
            Return to Catalog
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isAuthorizedViewer = Boolean(
    currentUser &&
    (currentUser.role === "admin" ||
     course.trainerId === currentUser.id ||
     (course.trainerName && currentUser.name && course.trainerName.toLowerCase() === currentUser.name.toLowerCase()))
  );

  if (course.status === "pending_approval" && !isAuthorizedViewer) {
    return (
      <DashboardLayout
        pageTitle="Curriculum Under Review"
        breadcrumbs={[
          { label: "Courses", to: "/courses" },
          { label: "Under Review" }
        ]}
      >
        <div className="max-w-md mx-auto my-16 p-8 glass-panel border border-amber-500/25 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">Curriculum Under Administrative Review</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            "{course.title}" was authored by {course.trainerName || "Faculty"} and is currently awaiting approval from platform administrators before general availability.
          </p>
          <p className="text-[11px] text-slate-400">
            Please explore our currently active and published courses in the catalog.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="apple-btn-primary text-xs px-5 py-2.5 font-bold mx-auto flex items-center gap-2 cursor-pointer"
          >
            Explore Available Courses
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const mainResource = course?.resources?.[0];

  const handleSelectLesson = (idx: number) => {
    setSelectedLessonIndex(idx);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleComplete = () => {
    if (course && currentUser) {
      completeCourse(currentUser.id, course.id);
      addToast({
        title: "Course Marked Completed!",
        message: "Your verifiable certificate has been generated and issued.",
        type: "success"
      });
      navigate("/trainee/certificates");
    }
  };

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) return;

    const newThread = {
      id: "disc-" + Date.now(),
      courseId: course.id,
      title: newQuestionTitle,
      content: newQuestion,
      authorId: currentUser?.id || "u-trainee-1",
      authorName: currentUser?.name || "Trainee",
      authorRole: "trainee" as const,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      upvotedBy: [],
      replies: []
    };

    setDiscussions([newThread, ...discussions]);
    setNewQuestionTitle("");
    setNewQuestion("");
    addToast({
      title: "Question Posted to Forum",
      message: "Trainers and peers have been notified.",
      type: "success"
    });
  };

  const currentLesson = allLessons.length > 0 ? (allLessons[selectedLessonIndex] || allLessons[0]) : null;
  const activeVideoUrl = currentLesson?.youtubeUrl || mainResource?.url || course.videoUrl;
  const activeVideoTitle = currentLesson ? `${currentLesson.lessonNumber}. ${currentLesson.title}` : course.title;

  // Filter lessons based on search and active module
  const filteredLessons = allLessons.filter((l) => {
    const term = lessonSearch.trim().toLowerCase();
    const matchesSearch =
      !term ||
      l.title.toLowerCase().includes(term) ||
      String(l.lessonNumber).includes(term);

    const mod = currentModuleFilters.find((m) => m.label === activeModuleFilter);
    const matchesModule = mod ? l.lessonNumber >= mod.start && l.lessonNumber <= mod.end : true;

    return matchesSearch && matchesModule;
  });

  const assessmentId = (course && COURSE_ASSESSMENT_MAP[course.id]) || "a-webdev-sigma";

  const courseFeedbacks = feedbacks.filter((f) => f.courseId === course.id || f.courseId === id);
  const avgCourseRating =
    courseFeedbacks.length > 0
      ? (courseFeedbacks.reduce((acc, f) => acc + f.rating, 0) / courseFeedbacks.length).toFixed(1)
      : (course.rating && course.totalRatings && course.totalRatings > 0)
      ? course.rating.toFixed(1)
      : null;

  // Google Meet Sessions connected directly to this course or teacher
  const courseSessions = sessions.filter((s) => {
    return (
      s.courseId === course.id ||
      s.courseId === id ||
      (s.trainerId && course.trainerId && s.trainerId === course.trainerId) ||
      (s.trainerName && course.trainerName && s.trainerName.toLowerCase().includes(course.trainerName.toLowerCase())) ||
      (s.courseTitle && course.title && s.courseTitle.toLowerCase().includes(course.title.toLowerCase()))
    );
  });

  const courseLiveSession = courseSessions.find((s) => s.status === "live");
  const courseUpcomingSessions = courseSessions.filter((s) => s.status === "upcoming");

  return (
    <DashboardLayout
      pageTitle={course.title}
      breadcrumbs={[
        { label: "Courses", to: "/trainee/courses" },
        { label: course.title }
      ]}
    >
      <div className="space-y-6">
        {/* Course Under Review Preview Banner for Admin & Author */}
        {course.status === "pending_approval" && (
          <div className="glass-card p-4 border border-amber-500/40 bg-amber-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="badge text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                  Admin Review Pending
                </span>
                <p className="text-xs text-white font-semibold mt-0.5">
                  Authorized Preview Mode: This curriculum is currently pending administrative approval.
                </p>
                <p className="text-[11px] text-slate-400">
                  Trainees cannot see or enroll in this course until an administrator approves and publishes it.
                </p>
              </div>
            </div>
            {currentUser?.role === "admin" && (
              <button
                onClick={() => navigate("/admin/courses")}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shrink-0 cursor-pointer"
              >
                Go to Approval Portal
              </button>
            )}
          </div>
        )}

        {/* Course-Specific Live Meet Alert (If teacher is live right now for this course) */}
        {courseLiveSession && (
          <div className="glass-card p-5 border-2 border-rose-500/60 bg-gradient-to-r from-rose-950/70 via-[#1a0818] to-[#0c0f1c] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_35px_rgba(244,63,94,0.3)] relative overflow-hidden animate-pulse">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/25 border border-rose-500/60 text-rose-300 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-red text-[9px] uppercase font-black tracking-wider animate-pulse">
                    🔴 YOUR INSTRUCTOR IS LIVE NOW
                  </span>
                  {isEnrolled ? (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Enrolled Access Granted
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono">
                      Enrollment unlocks access
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-white">
                  {courseLiveSession.title}
                </h4>
                <p className="text-xs text-slate-300">
                  Instructor: <span className="text-white font-semibold">{courseLiveSession.trainerName}</span> • Google Meet Room: <span className="text-emerald-400 font-mono font-bold">{courseLiveSession.meetingCode}</span> (Auto-connected)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isEnrolled ? (
                <button
                  onClick={() => {
                    launchGoogleMeet(courseLiveSession.id, currentUser?.id, currentUser?.name, true);
                    addToast({
                      title: "Connecting to Google Meet",
                      message: `Opening ${courseLiveSession.title} with ${courseLiveSession.trainerName}.`,
                      type: "success"
                    });
                  }}
                  className="apple-btn-primary text-xs px-5 py-2.5 font-extrabold flex items-center gap-2 shadow-xl shadow-rose-600/40 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 cursor-pointer text-white transform hover:scale-[1.02] transition-all"
                >
                  <Video className="w-4 h-4" /> Join Google Meet (1-Click) ↗
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigate("/login");
                      return;
                    }
                    enroll(currentUser.id, id || "");
                    addToast({
                      title: "Enrolled in Course",
                      message: "You can now join the teacher's live Google Meet class!",
                      type: "success"
                    });
                  }}
                  className="apple-btn-primary text-xs px-5 py-2.5 font-bold flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600"
                >
                  Enroll to Join Live Class ↗
                </button>
              )}
              <button
                onClick={() => setActiveTab("live")}
                className="apple-btn-secondary text-xs px-3.5 py-2.5 font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Classroom Details →
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs Pill (Apple Style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 overflow-x-auto no-scrollbar touch-scroll max-w-full">
            <button
              onClick={() => setActiveTab("video")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "video" ? "bg-[#0071e3] text-white shadow-md font-bold" : "text-slate-400 hover:text-white")
              }
            >
              <Video className="w-3.5 h-3.5" /> All {allLessons.length} Videos Playlist
            </button>
            <button
              onClick={() => setActiveTab("slides")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "slides" ? "bg-[#0071e3] text-white shadow-md font-bold" : "text-slate-400 hover:text-white")
              }
            >
              <Presentation className="w-3.5 h-3.5" /> Slide Deck
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "resources" ? "bg-[#0071e3] text-white shadow-md font-bold" : "text-slate-400 hover:text-white")
              }
            >
              <FolderOpen className="w-3.5 h-3.5" /> Study Materials ({course.resources?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "ai" ? "bg-[#0071e3] text-white shadow-md font-bold" : "text-slate-400 hover:text-white")
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" /> AI Assistant
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "discussions" ? "bg-[#0071e3] text-white shadow-md font-bold" : "text-slate-400 hover:text-white")
              }
            >
              <MessageSquare className="w-3.5 h-3.5" /> Peer Q&A ({discussions.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 " +
                (activeTab === "reviews" ? "bg-[#0071e3] text-white shadow-md font-bold" : "text-slate-400 hover:text-white")
              }
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Reviews ({courseFeedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 relative " +
                (activeTab === "live"
                  ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 font-bold"
                  : courseLiveSession
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  : "text-slate-400 hover:text-white")
              }
            >
              {courseLiveSession ? (
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <Video className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Live Meet ({courseSessions.length})</span>
              {courseLiveSession && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentUser?.role === "trainee" && (
              isEnrolled ? (
                <button
                  onClick={handleUnenrollCourse}
                  className="apple-btn-secondary text-xs px-3.5 py-2 font-semibold text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1.5 transition"
                  title="Unenroll from this course"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Unenroll</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    enroll(currentUser.id, id || "");
                    addToast({
                      title: "Enrolled in Course",
                      message: `You are now enrolled in ${course?.title || "this course"}.`,
                      type: "success"
                    });
                  }}
                  className="apple-btn-primary text-xs px-3.5 py-2 font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Enroll in Course</span>
                </button>
              )
            )}
            <button
              onClick={() => navigate(`/trainee/assessment/${assessmentId}`)}
              className="apple-btn-secondary text-xs px-4 py-2 font-semibold cursor-pointer"
            >
              <Award className="w-4 h-4" /> Certification Exam
            </button>
            <button
              onClick={handleComplete}
              className="apple-btn-success text-xs px-4 py-2 font-semibold cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Finish & Claim Certificate
            </button>
          </div>
        </div>

        {/* Tab 1: Video Player & Interactive Playlist */}
        {activeTab === "video" && (
          allLessons.length === 0 ? (
            <div className="card p-10 text-center space-y-4 border-dashed border-white/20 animate-fadeIn my-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0071e3]/20 border border-[#2997ff]/40 text-[#2997ff] flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">Course Curriculum in Preparation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The faculty instructor ({course.trainerName}) has published this course and will be uploading video lectures shortly. You can access study materials, attend live Google Meet sessions, or ask questions in the peer discussion forum.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => setActiveTab("resources")}
                  className="apple-btn-secondary text-xs px-4 py-2 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> View Study Materials ({course.resources?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("live")}
                  className="apple-btn-primary text-xs px-4 py-2 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" /> Live Meet Classes ({courseSessions.length})
                </button>
                {(currentUser?.role === "admin" || currentUser?.id === course.trainerId || currentUser?.name === course.trainerName) && (
                  <Link
                    to="/trainer/courses"
                    className="apple-btn-primary text-xs px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload Video Lectures as Instructor ↗
                  </Link>
                )}
              </div>
            </div>
          ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. HORIZONTAL SINGLE LINE VIEW: All videos in a single scrollable row */}
            <div className="card p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-[#2997ff]" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Playlist Strip (All {allLessons.length} Videos in a Single Line • Click Any Video to Play)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-blue text-[10px] font-mono">
                    Playing: #{currentLesson?.lessonNumber || 1} of {allLessons.length}
                  </span>
                </div>
              </div>

              {/* Horizontal Single Line Scroll */}
              <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 custom-scrollbar snap-x">
                {allLessons.map((l, idx) => {
                  const isCurrent = currentLesson ? l.lessonNumber === currentLesson.lessonNumber : false;
                  return (
                    <button
                      key={l.id}
                      onClick={() => handleSelectLesson(idx)}
                      className={
                        "flex-shrink-0 w-44 sm:w-52 p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between snap-start " +
                        (isCurrent
                          ? "bg-[#0071e3]/25 border-[#2997ff] text-white shadow-lg shadow-blue-500/20 ring-1 ring-[#2997ff]"
                          : "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.08] hover:border-white/20")
                      }
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5 w-full">
                        <span
                          className={
                            "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold " +
                            (isCurrent ? "bg-[#0071e3] text-white" : "bg-black/50 text-slate-400")
                          }
                        >
                          {isCurrent ? "▶ PLAYING" : `VIDEO #${l.lessonNumber}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ⏱ {l.duration}
                        </span>
                      </div>
                      <p className={"text-xs line-clamp-2 " + (isCurrent ? "font-bold text-white" : "text-slate-300")}>
                        {l.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. MAIN VIDEO PLAYER AREA */}
            <div ref={playerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Video Stream */}
              <div className="lg:col-span-8 space-y-4">
                <AdaptiveVideoPlayer
                  videoUrl={activeVideoUrl}
                  thumbnail={getCourseThumbnail(course)}
                  transcripts={mainResource?.transcripts}
                  title={activeVideoTitle}
                  onProgress={(percent, sec) => {
                    if (currentUser && course && currentLesson && percent >= 80) {
                      markLessonWatched(
                        currentUser.id,
                        currentUser.name,
                        {
                          id: currentLesson.id || `lesson-${currentLesson.lessonNumber}`,
                          title: currentLesson.title,
                          courseId: course.id,
                          courseTitle: course.title,
                          trainerId: course.trainerId || "",
                          trainerName: course.trainerName || "",
                        },
                        percent,
                        sec
                      );
                    }
                  }}
                  onEnded={() => {
                    if (currentUser && course && currentLesson) {
                      markLessonWatched(
                        currentUser.id,
                        currentUser.name,
                        {
                          id: currentLesson.id || `lesson-${currentLesson.lessonNumber}`,
                          title: currentLesson.title,
                          courseId: course.id,
                          courseTitle: course.title,
                          trainerId: course.trainerId || "",
                          trainerName: course.trainerName || "",
                        },
                        100,
                        900
                      );
                    }
                  }}
                />

                <div className="card p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="badge-blue text-[10px] font-mono">
                          LESSON {currentLesson?.lessonNumber || 1} OF {allLessons.length}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ⏱ {currentLesson?.duration || ""}
                        </span>
                        <span className="badge-green text-[9px]">
                          ✓ Unrestricted Direct Access
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        {currentLesson?.title || course.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectLesson(Math.max(0, selectedLessonIndex - 1))}
                        disabled={selectedLessonIndex === 0}
                        className="apple-btn-secondary text-xs px-3 py-1.5 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous Video
                      </button>
                      <button
                        onClick={() => handleSelectLesson(Math.min(allLessons.length - 1, selectedLessonIndex + 1))}
                        disabled={selectedLessonIndex === allLessons.length - 1}
                        className="apple-btn-primary text-xs px-3 py-1.5 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                      >
                        Next Video <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Playlist Drawer / Lesson Selector */}
              <div className="lg:col-span-4 card p-4 space-y-3 flex flex-col h-[640px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ListVideo className="w-4 h-4 text-[#2997ff]" />
                    <h3 className="text-sm font-bold text-white">Playlist Videos</h3>
                  </div>
                  <span className="badge-blue text-[10px] font-mono">
                    {allLessons.length} Lessons
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search videos (e.g. loops, recursion, routing)..."
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    className="apple-input !pl-8 !py-1.5 text-xs w-full"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {filteredLessons.map((l) => {
                    const isCurrent = currentLesson ? l.lessonNumber === currentLesson.lessonNumber : false;
                    const originalIdx = allLessons.findIndex((item) => item.id === l.id);

                    return (
                      <div
                        key={l.id}
                        onClick={() => handleSelectLesson(originalIdx)}
                        className={
                          "p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 " +
                          (isCurrent
                            ? "bg-[#0071e3]/20 border-[#2997ff] text-white shadow-md shadow-blue-500/10"
                            : "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07]")
                        }
                      >
                        <div
                          className={
                            "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-mono font-bold mt-0.5 " +
                            (isCurrent
                              ? "bg-[#0071e3] text-white"
                              : "bg-black/40 text-slate-400")
                          }
                        >
                          {isCurrent ? <Play className="w-3 h-3 fill-white" /> : l.lessonNumber}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={"line-clamp-2 text-xs font-medium " + (isCurrent ? "text-white font-bold" : "text-slate-300")}>
                            {l.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                            ⏱ {l.duration}
                          </span>
                        </div>

                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-[#2997ff] shrink-0 mt-2 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. COMPLETE COURSE CATALOG: All videos shown with modules and direct 1-click play */}
            <div className="card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ListVideo className="w-5 h-5 text-[#2997ff]" />
                    Complete Course Curriculum ({allLessons.length} Videos Available)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    All {allLessons.length} videos are completely unlocked. Click any video below to instantly play it on the portal.
                  </p>
                </div>
                <span className="badge-green text-xs font-mono">
                  ✓ 100% Free Random Access
                </span>
              </div>

              {/* Module Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {currentModuleFilters.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedModuleFilter(m.label)}
                    className={
                      "px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer " +
                      (activeModuleFilter === m.label
                        ? "bg-[#0071e3] text-white shadow-sm"
                        : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]")
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLessons.map((l) => {
                  const isCurrent = currentLesson ? l.lessonNumber === currentLesson.lessonNumber : false;
                  const originalIdx = allLessons.findIndex((item) => item.id === l.id);

                  return (
                    <div
                      key={l.id}
                      onClick={() => handleSelectLesson(originalIdx)}
                      className={
                        "p-3.5 rounded-2xl border text-xs cursor-pointer transition flex flex-col justify-between space-y-3 group " +
                        (isCurrent
                          ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff] shadow-lg shadow-blue-500/10"
                          : "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.07] hover:border-white/20")
                      }
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold " +
                              (isCurrent ? "bg-[#0071e3] text-white" : "bg-black/50 text-slate-400")
                            }
                          >
                            {isCurrent ? "▶ NOW PLAYING" : `VIDEO #${l.lessonNumber}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ⏱ {l.duration}
                          </span>
                        </div>
                        <h4 className={"text-xs leading-snug line-clamp-2 " + (isCurrent ? "text-white font-bold" : "text-slate-200 group-hover:text-white")}>
                          {l.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Unlocked
                        </span>
                        <button
                          type="button"
                          className={
                            "px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer " +
                            (isCurrent
                              ? "bg-[#0071e3] text-white"
                              : "bg-white/10 text-slate-300 group-hover:bg-[#0071e3] group-hover:text-white")
                          }
                        >
                          <Play className="w-3 h-3 fill-current" /> {isCurrent ? "Watching" : "Play Video"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          )
        )}

        {/* Tab 2: Slide Deck Presentation Viewer */}
        {activeTab === "slides" && (
          <div className="space-y-6 animate-fadeIn">
            <SlideDeckViewer
              slides={mainResource?.slides || []}
              title={course.title}
              version={mainResource?.version}
            />
          </div>
        )}

        {/* Tab: Study Materials & Library Resources */}
        {activeTab === "resources" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#2997ff]" />
                    Official Course Study Materials & Library Repository
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Faculty presentations, curriculum handbooks, and reference notes indexed for this course.
                  </p>
                </div>
                <Link
                  to="/trainee/library"
                  className="apple-btn-secondary text-xs px-3.5 py-1.5 font-semibold text-[#2997ff] flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse Full Institutional Library</span>
                </Link>
              </div>

              {!course.resources || course.resources.length === 0 ? (
                <div className="p-8 text-center space-y-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">No external documents uploaded yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Your instructor will publish downloadable slide decks and cheat sheets here. You can also view the interactive Slide Deck in the adjacent tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#2997ff]/40 flex flex-col justify-between gap-3 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0071e3]/20 text-[#2997ff] flex items-center justify-center shrink-0 mt-0.5">
                          {res.type === "presentation" ? (
                            <Presentation className="w-5 h-5" />
                          ) : res.type === "video" ? (
                            <Video className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white line-clamp-1">{res.title}</h4>
                            <span className="badge-blue text-[8px] py-0.5 uppercase shrink-0">{res.type}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {res.summary || res.description || "Official course curriculum and reference resource."}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Size: {res.size || "8.5 MB"} • Version: {res.version || "v2.0"} • Faculty: {res.uploadedBy || course.trainerName}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="badge-green text-[9px]">READY FOR OFFLINE STUDY</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (res.fileData) {
                              const a = document.createElement("a");
                              a.href = res.fileData;
                              a.download = res.fileName || `${res.title.replace(/\s+/g, "_")}.${res.type === "pdf" ? "pdf" : res.type === "presentation" ? "pptx" : "mp4"}`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);

                              addToast({
                                title: "Download Started",
                                message: `Saved "${res.fileName || res.title}" to your device.`,
                                type: "success"
                              });
                              return;
                            }

                            addToast({
                              title: "Downloading Learning Resource",
                              message: `"${res.title}" is ready for offline reading and review.`,
                              type: "success"
                            });
                          }}
                          className="apple-btn-secondary text-xs px-3 py-1 font-semibold flex items-center gap-1.5 text-[#2997ff] hover:text-white cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#2997ff]" />
                          <span>Download / Study</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: AI Learning Hub */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            <AiCourseSummarizer
              summary={mainResource?.summary}
              keyTakeaways={mainResource?.keyTakeaways}
              flashcards={mainResource?.flashcards}
              courseTitle={course.title}
            />
            <AiDoubtSolverChat courseTitle={course.title} />
          </div>
        )}

        {/* Tab 4: Peer Discussion & Q&A Forum */}
        {activeTab === "discussions" && (
          <div className="space-y-6 animate-fadeIn">
            {/* New Question Box */}
            <form onSubmit={handlePostDiscussion} className="card p-5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2997ff]" /> Ask a Question in this Course
              </h4>
              <input
                type="text"
                required
                placeholder="Question headline / concept..."
                className="apple-input text-xs"
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
              />
              <textarea
                rows={2}
                placeholder="Provide details about what you are testing or experiencing..."
                className="apple-input text-xs"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <button type="submit" className="apple-btn-primary text-xs px-4 py-2 font-semibold cursor-pointer">
                Post Question to Forum
              </button>
            </form>

            {/* Discussion Thread List */}
            <div className="space-y-4">
              {discussions.map((d) => (
                <div key={d.id} className="card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{d.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{d.content}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">
                        Asked by <strong className="text-slate-200">{d.authorName}</strong> ({d.authorRole}) • {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge-blue text-[10px] shrink-0">▲ {d.upvotes} Upvotes</span>
                  </div>

                  {/* Replies */}
                  {d.replies.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2.5">
                      {d.replies.map((r) => (
                        <div key={r.id} className={"p-3 rounded-xl border text-xs space-y-1 " + (r.isTrainerVerified ? "bg-[#0071e3]/10 border-[#2997ff]/30 text-slate-200" : "bg-white/[0.03] border-white/5 text-slate-300")}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{r.authorName}</span>
                            {r.isTrainerVerified && (
                              <span className="badge-green text-[9px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Trainer Verified Answer
                              </span>
                            )}
                          </div>
                          <p className="leading-relaxed">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Student Quality Ratings & Feedback Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Student Quality Rating Summary</span>
                </h4>
                <div className="flex items-center gap-2">
                  {avgCourseRating ? (
                    <>
                      <span className="text-3xl font-extrabold text-amber-300 font-mono">{avgCourseRating}</span>
                      <div>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(Number(avgCourseRating))
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Based on {courseFeedbacks.length} student reviews
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-300">No ratings yet</p>
                      <p className="text-[11px] text-slate-400">
                        Be the first student to review and rate this course!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/trainee/feedback?courseId=${course.id}`}
                  className="apple-btn-primary text-xs px-4 py-2.5 font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Rate & Review this Course</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      addToast({
                        title: "Login Required",
                        message: "Please log in as a student to enroll and rate this course.",
                        type: "info"
                      });
                      navigate("/login");
                      return;
                    }
                    enroll(currentUser.id, id || "");
                    addToast({
                      title: "Enrolled in Course",
                      message: `You are now enrolled in ${course?.title}! You can now submit your quality rating and feedback.`,
                      type: "success"
                    });
                  }}
                  className="apple-btn-secondary text-xs px-4 py-2.5 font-semibold flex items-center gap-1.5 shrink-0"
                  title="Enroll in this course to rate and review it"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#2997ff]" />
                  <span>Enroll to Rate Course</span>
                </button>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {courseFeedbacks.length === 0 ? (
                <div className="card p-8 text-center text-xs text-slate-400 italic">
                  No student reviews submitted for this course yet. Be the first to leave feedback!
                </div>
              ) : (
                courseFeedbacks.map((fb) => (
                  <div key={fb.id} className="card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-xs">{fb.traineeName}</p>
                        <p className="text-[10px] text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-white ml-1">{fb.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{fb.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Live Google Meet Classroom & Schedule */}
        {activeTab === "live" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Live Now Card if Active */}
            {courseLiveSession ? (
              <div className="glass-card p-6 border-2 border-rose-500/60 bg-gradient-to-r from-rose-950/60 via-[#120816] to-[#0a0d18] rounded-2xl space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="badge-red text-[9px] uppercase font-bold tracking-wider animate-pulse">
                        TEACHER IS LIVE RIGHT NOW
                      </span>
                      <h3 className="text-lg font-extrabold text-white mt-0.5">{courseLiveSession.title}</h3>
                      <p className="text-xs text-slate-300">
                        Conducted by <strong className="text-white">{courseLiveSession.trainerName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {isEnrolled ? (
                      <button
                        onClick={() => {
                          launchGoogleMeet(courseLiveSession.id, currentUser?.id, currentUser?.name, true);
                          addToast({
                            title: "Opening Google Meet",
                            message: `Launching "${courseLiveSession.title}". Attendance verified.`,
                            type: "success"
                          });
                        }}
                        className="apple-btn-primary px-6 py-3 font-bold text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transform hover:scale-[1.02] transition"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Live Google Meet (1-Click) ↗</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            navigate("/login");
                            return;
                          }
                          enroll(currentUser.id, id || "");
                          addToast({
                            title: "Enrolled in Course",
                            message: "Live class unlocked! Click to join.",
                            type: "success"
                          });
                        }}
                        className="apple-btn-primary px-6 py-3 font-bold text-xs bg-gradient-to-r from-amber-600 to-orange-600 cursor-pointer"
                      >
                        Enroll in Course to Join ↗
                      </button>
                    )}

                    <button
                      onClick={() => openClassroom(courseLiveSession)}
                      className="apple-btn-secondary px-4 py-3 font-semibold text-xs text-slate-300 hover:text-white cursor-pointer"
                      title="Open in-portal companion hub"
                    >
                      In-Portal Hub ↗
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Google Meet Code</span>
                    <p className="font-mono text-xs font-bold text-emerald-400">
                      {isEnrolled ? courseLiveSession.meetingCode : "••••-•••• (enroll to view)"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Attendance Status</span>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Auto-Certified in LMS
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Lecture Duration</span>
                    <p className="text-xs font-bold text-white font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {courseLiveSession.durationMinutes || 60} Minutes
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Upcoming Classes Section */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Live Classes & Google Meet Schedule</h4>
                  <p className="text-xs text-slate-400">
                    Interactive faculty lectures, real-time code reviews, and problem sessions for {course.title}
                  </p>
                </div>
                <Link
                  to="/trainee/live-classes"
                  className="text-xs text-[#2997ff] hover:underline font-semibold"
                >
                  All Campus Live Classes →
                </Link>
              </div>

              {courseUpcomingSessions.length === 0 && !courseLiveSession ? (
                <div className="p-8 text-center space-y-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <Video className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">No Live Google Meet Sessions Active Right Now</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    When {course.trainerName} schedules or starts a live Google Meet class for this course, you will receive an automatic announcement alert, and the 1-click join link will be placed right here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseUpcomingSessions.map((session) => {
                    const formattedDate = new Date(session.scheduledAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div
                        key={session.id}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="badge-purple text-[8px] font-bold">UPCOMING GOOGLE MEET</span>
                            <span className="text-[10px] text-slate-400 font-mono">{formattedDate}</span>
                            <span className="text-[10px] text-slate-400 font-mono">• {session.durationMinutes}m</span>
                          </div>
                          <h5 className="text-xs font-bold text-white">{session.title}</h5>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{session.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Room Code: {isEnrolled ? session.meetingCode : "••••-••••"} • Faculty: {session.trainerName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isEnrolled ? (
                            <>
                              <button
                                onClick={() => {
                                  launchGoogleMeet(session.id, currentUser?.id, currentUser?.name, true);
                                  addToast({
                                    title: "Opening Google Meet",
                                    message: `Connecting to room ${session.meetingCode}.`,
                                    type: "success"
                                  });
                                }}
                                className="apple-btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Meet ↗</span>
                              </button>
                              {session.calendarUrl && (
                                <a
                                  href={session.calendarUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="apple-btn-secondary text-xs p-1.5 text-amber-400"
                                  title="Add to Google Calendar"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                enroll(currentUser?.id || "", id || "");
                                addToast({
                                  title: "Enrolled in Course",
                                  message: "You can now attend this class.",
                                  type: "success"
                                });
                              }}
                              className="apple-btn-secondary text-xs px-3 py-1.5 text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                            >
                              Enroll to Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default CourseDetail;
