import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Video, Presentation, Sparkles, MessageSquare, Award,
  CheckCircle2, AlertTriangle, ListVideo, Search, ChevronLeft,
  ChevronRight, Play, ExternalLink, Star, LogOut, BookOpen
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { AdaptiveVideoPlayer } from "../../components/video/AdaptiveVideoPlayer";
import { SlideDeckViewer } from "../../components/video/SlideDeckViewer";
import { AiCourseSummarizer } from "../../components/ai/AiCourseSummarizer";
import { AiDoubtSolverChat } from "../../components/ai/AiDoubtSolverChat";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
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
  "c-se": "a-se-iit",
  "c-raj-tiwari-dsa": "a-dsa-striver"
};

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, enrollments, enroll, unenroll, completeCourse, feedbacks } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"video" | "slides" | "ai" | "discussions" | "reviews">("video");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [lessonSearch, setLessonSearch] = useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>("");

  const isEnrolled = Boolean(
    currentUser &&
    currentUser.role === "trainee" &&
    enrollments.some((e) => e.traineeId === currentUser.id && e.courseId === id)
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
          { label: "Courses", to: "/trainee/courses" },
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
            onClick={() => navigate("/trainee/courses")}
            className="apple-btn-primary text-xs px-5 py-2.5 font-bold mx-auto flex items-center gap-2 cursor-pointer"
          >
            Return to Catalog
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

  const currentLesson = allLessons[selectedLessonIndex] || allLessons[0];
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

  return (
    <DashboardLayout
      pageTitle={course.title}
      breadcrumbs={[
        { label: "Courses", to: "/trainee/courses" },
        { label: course.title }
      ]}
    >
      <div className="space-y-6">
        {/* Navigation Tabs Pill (Apple Style) */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              onClick={() => setActiveTab("video")}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " +
                (activeTab === "video" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")
              }
            >
              <Video className="w-3.5 h-3.5" /> All {allLessons.length} Videos Playlist
            </button>
            <button
              onClick={() => setActiveTab("slides")}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " +
                (activeTab === "slides" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")
              }
            >
              <Presentation className="w-3.5 h-3.5" /> Slide Deck
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " +
                (activeTab === "ai" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" /> AI Assistant & Cards
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " +
                (activeTab === "discussions" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")
              }
            >
              <MessageSquare className="w-3.5 h-3.5" /> Peer Q&A ({discussions.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " +
                (activeTab === "reviews" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")
              }
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Student Reviews ({courseFeedbacks.length})
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
                    Playing: #{currentLesson.lessonNumber} of {allLessons.length}
                  </span>
                </div>
              </div>

              {/* Horizontal Single Line Scroll */}
              <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 custom-scrollbar snap-x">
                {allLessons.map((l, idx) => {
                  const isCurrent = l.lessonNumber === currentLesson.lessonNumber;
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
                />

                <div className="card p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="badge-blue text-[10px] font-mono">
                          LESSON {currentLesson.lessonNumber} OF {allLessons.length}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ⏱ {currentLesson.duration}
                        </span>
                        <span className="badge-green text-[9px]">
                          ✓ Unrestricted Direct Access
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        {currentLesson.title}
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
                    const isCurrent = l.lessonNumber === currentLesson.lessonNumber;
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
                  const isCurrent = l.lessonNumber === currentLesson.lessonNumber;
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
      </div>
    </DashboardLayout>
  );
};
export default CourseDetail;
