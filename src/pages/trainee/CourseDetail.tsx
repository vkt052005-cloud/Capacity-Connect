import React, { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Video, Presentation, Sparkles, MessageSquare, Award,
  CheckCircle2, AlertTriangle, ListVideo, Search, ChevronLeft,
  ChevronRight, Play, ExternalLink
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

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, completeCourse } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"video" | "slides" | "ai" | "discussions">("video");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [lessonSearch, setLessonSearch] = useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>("");

  // Ensure course is always resolved, falling back to seed data if localStorage is stale
  const foundCourse = courses.find((c) => c.id === id);
  const course = foundCourse || initialCourses.find((c) => c.id === id) || initialCourses.find((c) => c.id === "c6");
  const isDsaCourse = id === "c-dsa" || course?.id === "c-dsa" || course?.title?.toLowerCase().includes("data structure") || false;

  const currentModuleFilters = isDsaCourse ? DSA_MODULE_FILTERS : WEBDEV_MODULE_FILTERS;
  const activeModuleFilter = selectedModuleFilter && currentModuleFilters.some(m => m.label === selectedModuleFilter)
    ? selectedModuleFilter
    : currentModuleFilters[0].label;

  const [discussions, setDiscussions] = useState(
    initialDiscussions.filter((d) => d.courseId === "c1" || d.courseId === id || (isDsaCourse && d.courseId === "c-dsa"))
  );
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionTitle, setNewQuestionTitle] = useState("");

  // Ensure all lessons are always present and never empty
  const allLessons = useMemo(() => {
    if (course?.lessons && course.lessons.length > 0) {
      return course.lessons;
    }
    if (isDsaCourse) {
      return dsaLessons;
    }
    if (id === "c6" || course?.id === "c6") {
      return sigmaWebDevLessons;
    }
    const seedMatch = initialCourses.find((c) => c.id === id);
    if (seedMatch?.lessons && seedMatch.lessons.length > 0) {
      return seedMatch.lessons;
    }
    return sigmaWebDevLessons;
  }, [course, id, isDsaCourse]);

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
    // Smoothly scroll to video player if clicked from bottom catalog
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
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/trainee/assessment/${isDsaCourse ? "a-dsa-striver" : "a-webdev-sigma"}`)}
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
                  thumbnail={course.thumbnail}
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
                    placeholder="Search videos (e.g. HTML, CSS, React, 100)..."
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
      </div>
    </DashboardLayout>
  );
};
export default CourseDetail;
