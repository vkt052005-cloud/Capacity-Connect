import React, { useState, useRef } from "react";
import {
  BookOpen, Plus, Trash2, CheckCircle2, Video, ShieldCheck,
  ShieldAlert, Play, X, ExternalLink, Film, UploadCloud,
  ChevronDown, ChevronUp, Clock, AlertTriangle, Sparkles, FileVideo
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useNotificationsStore } from "../../store/notificationsStore";
import { AdaptiveVideoPlayer } from "../../components/video/AdaptiveVideoPlayer";
import { formatCourseDuration, extractMediaDuration } from "../../utils/courseDuration";
import { storeVideoBlob } from "../../utils/videoStorage";
import type { CourseCategory, CourseLesson, Resource } from "../../types";

export const TrainerCourses: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const { addNotification } = useNotificationsStore();

  // Verification Gate: Only admin-verified trainers can upload videos
  const isVerifiedTrainer = Boolean(
    currentUser?.role === "admin" ||
    currentUser?.isVerifiedByAdmin ||
    currentUser?.trainerProfile?.isVerifiedByAdmin
  );

  const [verificationRequested, setVerificationRequested] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);

  // New Course Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CourseCategory>("Technical");
  const [duration, setDuration] = useState("0 Mins");
  const [modulesCount, setModulesCount] = useState<number | "">("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");

  // Video Upload Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [targetCourseId, setTargetCourseId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("20 Mins");
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<"youtube" | "drive" | "url" | "file">("youtube");
  const [selectedFileBlob, setSelectedFileBlob] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [localVideoFileName, setLocalVideoFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video Lesson Manager State (Expanded course drawer & preview)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [previewVideoLesson, setPreviewVideoLesson] = useState<CourseLesson | null>(null);

  const trainerId = currentUser?.id || "";
  const myCourses = courses.filter(
    (c) => c.trainerId === trainerId || (currentUser?.name && c.trainerName === currentUser.name)
  );

  // Request admin verification handler
  const handleRequestVerification = () => {
    if (verificationRequested) return;
    setVerificationRequested(true);

    addNotification({
      type: "alert",
      title: "Instructor Verification Requested",
      content: `${currentUser?.name || "A trainer"} (${currentUser?.email || "trainer"}) has requested Admin verification to unlock video lecture publishing.`,
      author: currentUser?.name || "Faculty Trainer",
      pinned: true,
      link: "/admin/users"
    });

    addToast({
      title: "Verification Request Dispatched",
      message: "Platform administrators have been notified to review and verify your faculty credentials.",
      type: "success"
    });

    setShowUnverifiedModal(false);
  };

  // Open Video Upload Modal with Gate Check
  const handleOpenVideoModal = (preselectedCourseId?: string) => {
    if (!isVerifiedTrainer) {
      setShowUnverifiedModal(true);
      return;
    }

    if (myCourses.length === 0) {
      addToast({
        title: "Create a Course First",
        message: "You must create at least one course before attaching video lessons.",
        type: "warning"
      });
      setShowAddModal(true);
      return;
    }

    const initialId = preselectedCourseId || myCourses[0]?.id || "";
    setTargetCourseId(initialId);

    const targetCourse = courses.find((c) => c.id === initialId);
    const nextLessonNum = (targetCourse?.lessons?.length || 0) + 1;
    setLessonTitle(`Lesson ${nextLessonNum}: `);
    setVideoUrlInput("");
    setVideoDescription("");
    setLocalVideoFileName("");
    setShowVideoModal(true);
  };

  // Handle Local File Selection with automatic duration calculation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileBlob(file);
      setLocalVideoFileName(file.name);
      // Create local blob URL for instant preview & playback
      const objectUrl = URL.createObjectURL(file);
      setVideoUrlInput(objectUrl);
      if (!lessonTitle || lessonTitle.endsWith(": ")) {
        setLessonTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      // Automatically calculate duration of the selected video
      setIsCalculatingDuration(true);
      try {
        const calculated = await extractMediaDuration(file);
        setLessonDuration(calculated);
        addToast({
          title: "Video Duration Detected",
          message: `Calculated length: ${calculated}`,
          type: "info"
        });
      } catch (err) {
        console.error("Failed to extract duration", err);
      } finally {
        setIsCalculatingDuration(false);
      }
    }
  };

  // Handle URL Change with automatic duration probe if direct video
  const handleUrlChange = async (url: string) => {
    setVideoUrlInput(url);
    if (videoSourceType === "url" && (url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("commondatastorage"))) {
      setIsCalculatingDuration(true);
      try {
        const calculated = await extractMediaDuration(url);
        setLessonDuration(calculated);
      } catch {
        // Keep current duration
      } finally {
        setIsCalculatingDuration(false);
      }
    }
  };

  // Create Course Handler
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const modNum = typeof modulesCount === "number" && modulesCount > 0 ? modulesCount : undefined;
    const initialDuration = modNum ? `0 Mins • ${modNum} Modules` : "0 Mins";

    addCourse({
      id: "c-" + Date.now(),
      title,
      description,
      category,
      duration: initialDuration,
      modules: modNum,
      level,
      status: "active",
      trainerId,
      trainerName: currentUser?.name || "Faculty Trainer",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      tags: [category, level, "Capacity Building"],
      resources: [],
      lessons: []
    });

    setShowAddModal(false);
    setTitle("");
    setDescription("");
    setModulesCount("");
    addToast({
      title: "Course Created Successfully",
      message: "New curriculum published to catalog.",
      type: "success"
    });
  };

  // Submit Video Lesson Upload with IndexedDB persistence for local files
  const handleUploadVideoLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerifiedTrainer) {
      setShowUnverifiedModal(true);
      return;
    }

    if (!targetCourseId || !lessonTitle.trim() || !videoUrlInput.trim()) {
      addToast({
        title: "Missing Video Details",
        message: "Please specify lesson title and video URL / file.",
        type: "error"
      });
      return;
    }

    const course = courses.find((c) => c.id === targetCourseId);
    if (!course) return;

    const existingLessons = course.lessons || [];
    const lessonNumber = existingLessons.length + 1;
    const lessonId = "lesson-" + Date.now();

    let persistentUrl = videoUrlInput.trim();

    // If local file was uploaded, store it persistently in IndexedDB
    if (videoSourceType === "file" && selectedFileBlob) {
      try {
        const storageKey = `vid-${course.id}-${lessonId}`;
        await storeVideoBlob(storageKey, selectedFileBlob);
        persistentUrl = `indexeddb://${storageKey}`;
      } catch (err) {
        console.warn("Failed to write to IndexedDB, fallback to direct input", err);
      }
    }

    // Extract YouTube ID if applicable
    let videoId = `v-${Date.now()}`;
    const ytMatch = persistentUrl.match(/(?:youtu\.be\/|watch\?v=|embed\/)([^#&?]{11})/);
    if (ytMatch && ytMatch[1]) {
      videoId = ytMatch[1];
    }

    const newLesson: CourseLesson = {
      id: lessonId,
      lessonNumber,
      title: lessonTitle.trim(),
      duration: lessonDuration.trim() || "20 Mins",
      youtubeUrl: persistentUrl,
      videoId,
      videoSource: videoSourceType,
      description: videoDescription.trim() || undefined
    };

    const newResource: Resource = {
      id: "res-video-" + Date.now(),
      courseId: course.id,
      title: `${newLesson.title} (Video Lecture)`,
      type: "video",
      url: persistentUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.name || "Faculty Trainer",
      description: videoDescription.trim() || "Course video lecture uploaded by instructor."
    };

    const updatedLessons = [...existingLessons, newLesson];
    const updatedResources = [...(course.resources || []), newResource];

    // Recalculate dynamic course duration
    const courseWithNewLesson: typeof course = {
      ...course,
      lessons: updatedLessons
    };
    const updatedDuration = formatCourseDuration(courseWithNewLesson);

    updateCourse(course.id, {
      lessons: updatedLessons,
      resources: updatedResources,
      duration: updatedDuration
    });

    setShowVideoModal(false);
    setExpandedCourseId(course.id);
    addToast({
      title: "Video Lesson Uploaded & Published",
      message: `"${newLesson.title}" (${newLesson.duration}) has been appended to ${course.title}. Total course length: ${updatedDuration}.`,
      type: "success"
    });
  };

  // Delete Video Lesson
  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || !course.lessons) return;

    const filteredLessons = course.lessons
      .filter((l) => l.id !== lessonId)
      .map((l, idx) => ({ ...l, lessonNumber: idx + 1 }));

    const updatedCourse: typeof course = {
      ...course,
      lessons: filteredLessons
    };
    const updatedDuration = formatCourseDuration(updatedCourse);

    updateCourse(courseId, {
      lessons: filteredLessons,
      duration: updatedDuration
    });

    addToast({
      title: "Video Lesson Removed",
      message: "Lesson removed and course duration recalculated.",
      type: "info"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Course Curriculum & Video Studio"
      breadcrumbs={[
        { label: "Trainer Dashboard", to: "/trainer/dashboard" },
        { label: "Manage Courses" }
      ]}
    >
      <div className="space-y-6">
        {/* Verification Status Banner */}
        {!isVerifiedTrainer ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Video Publishing: Pending Admin Verification</h4>
                  <span className="badge-yellow text-[9px] font-bold">UNVERIFIED FACULTY</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Only teachers that have been verified by an Administrator can upload videos and publish multimedia lectures. You can author course syllabi, but video uploading remains locked until verified.
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestVerification}
              disabled={verificationRequested}
              className="apple-btn-secondary text-xs px-4 py-2 font-semibold text-amber-300 border-amber-500/40 hover:bg-amber-500/20 shrink-0 cursor-pointer"
            >
              {verificationRequested ? "Verification Requested ✓" : "Request Admin Verification"}
            </button>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Verified Faculty Instructor</span>
                  <span className="badge-green text-[8px] font-bold">VIDEO STUDIO UNLOCKED</span>
                </p>
                <p className="text-[11px] text-slate-300">You are verified by Platform Administration to author, upload, and embed video lessons directly into your curricula.</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenVideoModal()}
              className="apple-btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" /> Upload Video
            </button>
          </div>
        )}

        {/* Page Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Your Authored Courses ({myCourses.length})</h3>
            <p className="text-xs text-slate-400">Design syllabus, upload slide decks, and publish verified video recordings</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenVideoModal()}
              className={
                "text-xs px-4 py-2 font-bold flex items-center gap-1.5 rounded-xl transition cursor-pointer " +
                (isVerifiedTrainer
                  ? "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20"
                  : "bg-white/5 border border-white/10 text-slate-400 hover:text-amber-300 hover:border-amber-500/40")
              }
            >
              <Video className="w-4 h-4" />
              <span>Upload Video Lesson</span>
              {!isVerifiedTrainer && <span className="text-[9px] text-amber-400 font-mono">(Locked)</span>}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="apple-btn-secondary text-xs px-4 py-2 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Course
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {myCourses.length === 0 ? (
          <div className="card p-12 text-center space-y-3 border-dashed border-white/20">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Courses Created Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have not published any courses yet. Click "Create Course" above to author your first curriculum.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((c) => {
              const videoCount = c.lessons?.length || 0;
              const isExpanded = expandedCourseId === c.id;
              return (
                <div key={c.id} className="glass-card p-5 space-y-4 flex flex-col justify-between border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge-blue text-[9px]">{c.category}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="badge text-[9px] bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Film className="w-3 h-3" /> {videoCount} {videoCount === 1 ? "Video" : "Videos"}
                        </span>
                        <span className="badge-gray text-[9px]">{c.level}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{c.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.description}</p>
                    </div>

                    {/* Expand Video Lessons Manager Drawer */}
                    <div className="pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setExpandedCourseId(isExpanded ? null : c.id)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[11px] font-semibold text-slate-300 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-[#2997ff]" />
                          <span>Curriculum Videos ({videoCount})</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Expanded Lessons List */}
                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {videoCount === 0 ? (
                            <p className="text-[11px] text-slate-500 italic text-center py-3">
                              No videos uploaded to this course yet.
                            </p>
                          ) : (
                            c.lessons?.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs hover:border-white/15 transition group"
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span className="w-4 h-4 rounded bg-[#0071e3]/20 text-[#2997ff] text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {lesson.lessonNumber}
                                  </span>
                                  <div className="truncate">
                                    <p className="font-semibold text-white truncate text-[11.5px]">{lesson.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{lesson.duration}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setPreviewVideoLesson(lesson)}
                                    className="p-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                                    title="Play Preview"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(c.id, lesson.id)}
                                    className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}

                          <button
                            onClick={() => handleOpenVideoModal(c.id)}
                            className="w-full mt-2 py-1.5 px-3 rounded-lg border border-dashed border-[#2997ff]/40 hover:bg-[#0071e3]/10 text-[11px] font-bold text-[#2997ff] flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Video Lesson
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">{formatCourseDuration(c)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenVideoModal(c.id)}
                        className="text-xs text-[#2997ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" /> +Video
                      </button>
                      <button
                        onClick={() => deleteCourse(c.id)}
                        className="text-rose-400 hover:text-rose-300 transition p-1 cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal 1: Upload Video Lesson ────────────────────────────────────────── */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
          <div className="glass-panel p-5 sm:p-7 max-w-lg w-full border border-white/20 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0071e3]/20 flex items-center justify-center text-[#2997ff]">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Course Video Lesson</h3>
                  <p className="text-xs text-slate-400">Verified Instructor Publishing Studio</p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadVideoLesson} className="space-y-3.5 text-xs">
              {/* Target Course */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Course Curriculum <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="apple-input text-xs w-full cursor-pointer"
                >
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.lessons?.length || 0} existing lessons)
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lesson Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master React Hooks & State Management"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="apple-input text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Duration</span>
                    {isCalculatingDuration && (
                      <span className="text-[10px] text-[#2997ff] flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" /> Calculating...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25:40 or 20 Mins"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="apple-input text-xs w-full"
                  />
                </div>
              </div>

              {/* Video Source Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Video Source Method <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSourceType("youtube");
                      setVideoUrlInput("");
                      setLocalVideoFileName("");
                      setSelectedFileBlob(null);
                    }}
                    className={
                      "py-2 px-2 rounded-xl font-semibold border text-center transition cursor-pointer text-xs " +
                      (videoSourceType === "youtube"
                        ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white")
                    }
                  >
                    YouTube Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSourceType("drive");
                      setVideoUrlInput("");
                      setLocalVideoFileName("");
                      setSelectedFileBlob(null);
                    }}
                    className={
                      "py-2 px-2 rounded-xl font-semibold border text-center transition cursor-pointer text-xs " +
                      (videoSourceType === "drive"
                        ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white")
                    }
                  >
                    Google Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSourceType("url");
                      setVideoUrlInput("");
                      setLocalVideoFileName("");
                      setSelectedFileBlob(null);
                    }}
                    className={
                      "py-2 px-2 rounded-xl font-semibold border text-center transition cursor-pointer text-xs " +
                      (videoSourceType === "url"
                        ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white")
                    }
                  >
                    Direct MP4 / CDN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSourceType("file");
                      setVideoUrlInput("");
                      setLocalVideoFileName("");
                    }}
                    className={
                      "py-2 px-2 rounded-xl font-semibold border text-center transition cursor-pointer text-xs " +
                      (videoSourceType === "file"
                        ? "bg-[#0071e3]/20 border-[#2997ff] text-white ring-1 ring-[#2997ff]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white")
                    }
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {/* Video Input depending on source */}
              {videoSourceType === "youtube" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    YouTube Video or Playlist URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://www.youtube.com/watch?v=WXk7yDqsKxs or playlist link"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="apple-input text-xs w-full"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Supports single YouTube videos, timestamped links, and playlist series.
                  </p>
                </div>
              )}

              {videoSourceType === "drive" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Drive Video Share Link <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="apple-input text-xs w-full"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Paste any Google Drive share link (set access to "Anyone with the link"). The player automatically embeds it securely for students.
                  </p>
                </div>
              )}

              {videoSourceType === "url" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Direct Video Stream URL (.mp4 / .webm) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    value={videoUrlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="apple-input text-xs w-full"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Direct HTTPS link to an MP4 or WebM video file.
                  </p>
                </div>
              )}

              {videoSourceType === "file" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Local Video File (.mp4, .webm) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 border border-dashed border-white/20 hover:border-[#2997ff]/60 rounded-xl bg-white/[0.02] text-center cursor-pointer transition space-y-2"
                  >
                    <UploadCloud className="w-8 h-8 text-[#2997ff] mx-auto" />
                    {localVideoFileName ? (
                      <div>
                        <p className="text-xs font-bold text-white">{localVideoFileName}</p>
                        <p className="text-[10px] text-emerald-400">File selected & ready for preview</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Click to choose a video file from your computer</p>
                        <p className="text-[10px] text-slate-500">MP4, WebM formats supported</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lesson Summary & Key Concepts (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline topics covered, key code snippets, or takeaways..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="apple-input text-xs w-full resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="submit"
                  disabled={!videoUrlInput.trim()}
                  className="apple-btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Video className="w-3.5 h-3.5" /> Publish Video Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="apple-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Unverified Teacher Restriction Alert ─────────────────────────── */}
      {showUnverifiedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel p-6 max-w-md w-full border border-amber-500/30 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Admin Verification Required</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Only faculty members verified by an Administrator can upload videos and author new curriculum media. This quality control ensures institutional standards across all enrolled trainees.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left space-y-1">
              <p className="text-[11px] font-bold text-slate-200">How to get verified:</p>
              <ul className="text-[10.5px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Click "Request Admin Verification" below.</li>
                <li>Your request will be recorded in the Admin Governance ledger.</li>
                <li>An administrator will review your faculty profile and grant upload authority.</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={verificationRequested}
                className="apple-btn-primary flex-1 py-2 text-xs font-bold cursor-pointer"
              >
                {verificationRequested ? "Request Sent ✓" : "Request Admin Verification"}
              </button>
              <button
                type="button"
                onClick={() => setShowUnverifiedModal(false)}
                className="apple-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Video Player Preview Modal ───────────────────────────────────── */}
      {previewVideoLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel max-w-3xl w-full border border-white/20 shadow-2xl overflow-hidden space-y-3">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#2997ff]" />
                <h4 className="text-xs font-bold text-white truncate max-w-md">
                  Lesson #{previewVideoLesson.lessonNumber}: {previewVideoLesson.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewVideoLesson(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <AdaptiveVideoPlayer
                videoUrl={previewVideoLesson.youtubeUrl}
                title={previewVideoLesson.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 4: Create Course Modal ────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel p-6 max-w-md w-full border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus in Cloud Infrastructure"
                  className="apple-input text-xs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Overview of learning outcomes..."
                  className="apple-input text-xs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    className="apple-input text-xs"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
                  <select
                    className="apple-input text-xs"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number of Modules <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Leave empty if course has no distinct modules"
                  className="apple-input text-xs w-full"
                  value={modulesCount}
                  onChange={(e) => setModulesCount(e.target.value ? parseInt(e.target.value, 10) : "")}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Duration is calculated dynamically as video lessons are added. Modules are only displayed if specified.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="apple-btn-primary flex-1 text-xs py-2 font-bold cursor-pointer">
                  Publish Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="apple-btn-secondary text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TrainerCourses;
