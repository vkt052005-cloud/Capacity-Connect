import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen, Video, Presentation, Sparkles, MessageSquare, Award,
  CheckCircle2, ArrowRight, Share2, Star, CheckSquare, Layers, Download, AlertTriangle,
  ListVideo, Search, ChevronLeft, ChevronRight, Play
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { AdaptiveVideoPlayer } from "../../components/video/AdaptiveVideoPlayer";
import { SlideDeckViewer } from "../../components/video/SlideDeckViewer";
import { AiCourseSummarizer } from "../../components/ai/AiCourseSummarizer";
import { AiDoubtSolverChat } from "../../components/ai/AiDoubtSolverChat";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { initialDiscussions } from "../../data/seed";

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, completeCourse } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"video" | "slides" | "ai" | "discussions">("video");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [lessonSearch, setLessonSearch] = useState("");
  const [discussions, setDiscussions] = useState(initialDiscussions.filter((d) => d.courseId === "c1" || d.courseId === id));
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionTitle, setNewQuestionTitle] = useState("");

  const course = courses.find((c) => c.id === id);

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
            className="apple-btn-primary text-xs px-5 py-2.5 font-bold mx-auto flex items-center gap-2"
          >
            Return to Catalog
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const mainResource = course?.resources?.[0];

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

  const allLessons = course.lessons || [];
  const filteredLessons = allLessons.filter((l) =>
    !lessonSearch.trim() ||
    l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    String(l.lessonNumber).includes(lessonSearch.trim())
  );

  const currentLesson = allLessons[selectedLessonIndex] || allLessons[0];
  const activeVideoUrl = currentLesson?.youtubeUrl || mainResource?.url || course.videoUrl;
  const activeVideoTitle = currentLesson ? `${currentLesson.lessonNumber}. ${currentLesson.title}` : course.title;

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
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              onClick={() => setActiveTab("video")}
              className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " + (activeTab === "video" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
            >
              <Video className="w-3.5 h-3.5" /> Video Lecture {allLessons.length > 0 ? `(${allLessons.length} Lessons)` : "(1080p)"}
            </button>
            <button
              onClick={() => setActiveTab("slides")}
              className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " + (activeTab === "slides" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
            >
              <Presentation className="w-3.5 h-3.5" /> Slide Deck
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " + (activeTab === "ai" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" /> AI Assistant & Cards
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer " + (activeTab === "discussions" ? "bg-[#0071e3] text-white shadow-md" : "text-slate-400 hover:text-white")}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Peer Q&A ({discussions.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/trainee/assessment/a-webdev-sigma`)}
              className="apple-btn-secondary text-xs px-4 py-2 font-semibold"
            >
              <Award className="w-4 h-4" /> Certification Exam
            </button>
            <button
              onClick={handleComplete}
              className="apple-btn-success text-xs px-4 py-2 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" /> Finish & Claim Certificate
            </button>
          </div>
        </div>

        {/* Tab 1: Video Player & Interactive Playlist */}
        {activeTab === "video" && (
          <div className="space-y-6 animate-fadeIn">
            {allLessons.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-white">
                          {currentLesson.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLessonIndex(Math.max(0, selectedLessonIndex - 1))}
                          disabled={selectedLessonIndex === 0}
                          className="apple-btn-secondary text-xs px-3 py-1.5 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                        <button
                          onClick={() => setSelectedLessonIndex(Math.min(allLessons.length - 1, selectedLessonIndex + 1))}
                          disabled={selectedLessonIndex === allLessons.length - 1}
                          className="apple-btn-primary text-xs px-3 py-1.5 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Playlist Drawer / Lesson Selector */}
                <div className="lg:col-span-4 card p-4 space-y-3 flex flex-col h-[680px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ListVideo className="w-4 h-4 text-[#2997ff]" />
                      <h3 className="text-sm font-bold text-white">Course Playlist</h3>
                    </div>
                    <span className="badge-blue text-[10px]">
                      {allLessons.length} Lessons
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter videos (e.g. HTML, CSS, React)..."
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
                          onClick={() => setSelectedLessonIndex(originalIdx)}
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
            ) : (
              <AdaptiveVideoPlayer
                videoUrl={course.videoUrl}
                thumbnail={course.thumbnail}
                transcripts={mainResource?.transcripts}
                title={course.title}
              />
            )}
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
              <button type="submit" className="apple-btn-primary text-xs px-4 py-2 font-semibold">
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
