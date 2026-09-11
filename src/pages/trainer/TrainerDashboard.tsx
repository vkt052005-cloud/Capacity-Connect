import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Users, Award, Video, Plus, CheckSquare,
  BarChart3, Sparkles, FolderOpen, Calendar, Clock, Radio,
  ExternalLink, X, ShieldCheck, ShieldAlert, BarChart2
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useAppStore } from "../../store/appStore";
import { useLiveSessionsStore, formatGoogleMeet } from "../../store/liveSessionsStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { LiveSession } from "../../types";
import { STANDARD_SUBJECTS, getSubjectById } from "../../data/subjects";

export const TrainerDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { courses } = useCoursesStore();
  const { assessments } = useAssessmentsStore();
  const {
    sessions,
    scheduleSession,
    startInstantMeet,
    launchGoogleMeet,
    startSession,
    openClassroom,
    updateSessionMeetUrl
  } = useLiveSessionsStore();
  const { addToast } = useAppStore();
  const { getTrainerSessionSummary } = useAttendanceStore();
  const trainerId = currentUser?.id || "";
  const myCourses = courses.filter((c) => c.trainerId === trainerId || (currentUser?.name && c.trainerName === currentUser.name));
  const mySessions = sessions.filter((s) => s.trainerId === trainerId || s.trainerName === currentUser?.name);
  const myAttendanceSummary = getTrainerSessionSummary(trainerId);
  const totalStudentsAttended = myAttendanceSummary.reduce((sum, s) => sum + s.count, 0);

  const isVerifiedTrainer = Boolean(
    currentUser?.role === "admin" ||
    currentUser?.isVerifiedByAdmin ||
    currentUser?.trainerProfile?.isVerifiedByAdmin
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(STANDARD_SUBJECTS[0].id);
  const [instantMeetTitle, setInstantMeetTitle] = useState(STANDARD_SUBJECTS[0].defaultTitle);
  const [instantMeetUrl, setInstantMeetUrl] = useState("");

  const [scheduleSubjectId, setScheduleSubjectId] = useState(STANDARD_SUBJECTS[0].id);
  const [sessionTitle, setSessionTitle] = useState(STANDARD_SUBJECTS[0].defaultTitle);
  const [sessionDate, setSessionDate] = useState("");
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const navigate = useNavigate();

  const handleOpenInstantModal = () => {
    const sub = getSubjectById(selectedSubjectId) || STANDARD_SUBJECTS[0];
    setSelectedSubjectId(sub.id);
    setInstantMeetUrl("");
    setShowInstantModal(true);
  };

  const handleUpdateLiveMeetLink = (sessionId: string, currentCode?: string) => {
    const code = currentCode || "";
    const input = window.prompt(
      "Enter your official Google Meet link or 10-letter room code (e.g. abc-defg-hij):",
      code !== "new" && !code.includes("xxx-yyyy-zzz") ? code : ""
    );
    if (input && input.trim()) {
      const success = updateSessionMeetUrl(sessionId, input.trim());
      if (success) {
        addToast({
          title: "Google Meet Link Updated",
          message: "The active room link was updated. Students can now join with 1-click!",
          type: "success"
        });
      }
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const sub = getSubjectById(subjectId);
    if (sub) {
      setInstantMeetTitle(sub.defaultTitle);
    } else {
      const course = courses.find((c) => c.id === subjectId);
      if (course) {
        setInstantMeetTitle(`Live Google Meet: ${course.title}`);
      }
    }
  };

  const handleScheduleSubjectChange = (subjectId: string) => {
    setScheduleSubjectId(subjectId);
    const sub = getSubjectById(subjectId);
    if (sub) {
      setSessionTitle(sub.defaultTitle);
    } else {
      const course = courses.find((c) => c.id === subjectId);
      if (course) {
        setSessionTitle(`Live Google Meet: ${course.title}`);
      }
    }
  };

  const handleBroadcastInstantMeet = (e: React.FormEvent) => {
    e.preventDefault();
    const meetDetails = formatGoogleMeet(instantMeetUrl);
    if (!meetDetails.isReal) {
      addToast({
        title: "Google Meet Link Required",
        message: "Please paste your Google Meet link (e.g. meet.google.com/abc-defg-hij) before broadcasting to students.",
        type: "error"
      });
      return;
    }

    const sub = getSubjectById(selectedSubjectId);
    const course = courses.find((c) => c.id === selectedSubjectId);
    const subjectName = sub?.name || course?.title || "Specialized Engineering Lab";
    const newSess = startInstantMeet({
      courseId: sub?.id || course?.id || "dsa",
      courseTitle: subjectName,
      trainerId,
      trainerName: currentUser?.name || "Faculty Trainer",
      title: instantMeetTitle.trim() || `Live Google Meet: ${subjectName}`,
      customMeetUrl: meetDetails.url
    });

    setShowInstantModal(false);
    addToast({
      title: "Google Meet Class Broadcasted Live",
      message: `"${newSess.title}" is now LIVE! Room Code: ${newSess.meetingCode}. All enrolled students alerted with auto-joining buzzer.`,
      type: "success"
    });
  };

  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    const sub = getSubjectById(scheduleSubjectId);
    const course = courses.find((c) => c.id === scheduleSubjectId);
    const subjectName = sub?.name || course?.title || "Specialized Technical Lab";

    const newSess = scheduleSession({
      courseId: sub?.id || course?.id || "dsa",
      courseTitle: subjectName,
      trainerId,
      trainerName: currentUser?.name || "Faculty Trainer",
      title: sessionTitle,
      description: "Scheduled live interactive technical lab and Q&A session.",
      scheduledAt: sessionDate || new Date(Date.now() + 3600000).toISOString(),
      durationMinutes: 60,
      googleMeetUrl: googleMeetUrl.trim() || undefined,
      meetingCode: googleMeetUrl.trim() || undefined,
      joinUrl: googleMeetUrl.trim() || "https://meet.google.com/new",
      platform: "google-meet",
      status: "upcoming"
    });

    setShowScheduleModal(false);
    setSessionTitle("");
    setGoogleMeetUrl("");
    addToast({
      title: "Google Meet Class Scheduled",
      message: `"${newSess.title}" is published for enrolled students.`,
      type: "success"
    });
  };

  return (
    <DashboardLayout
      pageTitle="Faculty & Trainer Console"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Trainer Dashboard" }]}
    >
      <div className="space-y-6">
        {/* Welcome Glass Banner */}
        <div className="glass-panel p-6 border border-white/15 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#0c0f1c] via-[#101426] to-[#0a0d16]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="badge-blue text-[10px]">FACULTY PORTAL</span>
                <span className="text-xs text-slate-400">• {currentUser?.name}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Faculty Control & Instruction Hub
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Manage curriculum assets, schedule live Google Meet classes with automatic attendance tracking, and author AI-assisted MCQ assessments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenInstantModal}
                className="apple-btn-primary text-xs px-3.5 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
                title="Immediately create and join a live Google Meet room"
              >
                <Video className="w-4 h-4 text-rose-300 animate-pulse" /> Instant Google Meet
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="apple-btn-secondary text-xs px-3.5 py-2.5 font-semibold flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <Plus className="w-4 h-4 text-[#2997ff]" /> Schedule Meet
              </button>
              <button
                onClick={() => navigate("/trainer/questionnaires")}
                className="apple-btn-secondary text-xs px-3.5 py-2.5 font-semibold"
              >
                Create Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Verification Status Quick Bar */}
        <div className={"p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 " + (isVerifiedTrainer ? "bg-emerald-500/10 border-emerald-500/25" : "bg-amber-500/10 border-amber-500/30")}>
          <div className="flex items-center gap-3">
            {isVerifiedTrainer ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">
                  {isVerifiedTrainer ? "Admin-Verified Faculty Instructor" : "Unverified Instructor (Video Publishing Pending)"}
                </h4>
                <span className={"badge text-[8px] font-bold " + (isVerifiedTrainer ? "badge-green" : "badge-yellow")}>
                  {isVerifiedTrainer ? "VERIFIED FOR VIDEO UPLOADS" : "ADMIN REVIEW REQUIRED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isVerifiedTrainer
                  ? "You have full authorization to author, upload, and embed video lectures into course curricula."
                  : "Only admin-verified teachers can upload videos. You can author syllabi or request admin verification in the Course Studio."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/trainer/courses"
              className={isVerifiedTrainer ? "apple-btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-sm" : "apple-btn-secondary text-xs px-3.5 py-1.5 font-semibold text-amber-300 border-amber-500/40 hover:bg-amber-500/20"}
            >
              {isVerifiedTrainer ? (
                <>
                  <Video className="w-3.5 h-3.5" /> Video Studio
                </>
              ) : (
                "Video Studio & Verification →"
              )}
            </Link>
          </div>
        </div>

        {/* Attendance Summary Card */}
        <div className="glass-card p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Class Attendance Summary</h3>
                <p className="text-[10px] text-slate-400">Trainees who joined your live sessions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-indigo-400">{totalStudentsAttended}</div>
              <div className="text-[10px] text-slate-500">Total Joins</div>
            </div>
          </div>
          {myAttendanceSummary.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {myAttendanceSummary.slice(0, 5).map((s) => (
                <div key={s.sessionId} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-xs text-slate-300 truncate max-w-[70%]">{s.sessionTitle}</span>
                  <span className="text-xs font-bold text-indigo-300 shrink-0">{s.count} joined</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 text-center py-2">No attendance data yet. Attendance is recorded when trainees join your live sessions.</p>
          )}
        </div>

        {/* Live Google Meet Classes Hub */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Live Interactive Sessions ({mySessions.length})</h3>
              <p className="text-xs text-slate-400">Launch live Google Meet classrooms with real-time video, whiteboard notes, and student attendance</p>
            </div>
            <Link to="/trainer/live-classes" className="text-xs text-[#2997ff] hover:underline font-semibold">
              Live Meet Console →
            </Link>
          </div>

          {mySessions.length === 0 ? (
            <div className="card p-10 text-center space-y-3 border-dashed border-white/20">
              <Video className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Live Sessions Scheduled</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You do not have any active or upcoming live meet classes. Click "Instant Google Meet" or "Schedule Meet" above to create an interactive lecture.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleOpenInstantModal}
                  className="apple-btn-primary text-xs px-4 py-2.5 font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 cursor-pointer text-white"
                >
                  <Radio className="w-3.5 h-3.5 text-white animate-pulse" /> Go Live (Google Meet)
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="apple-btn-secondary text-xs px-4 py-2 font-semibold cursor-pointer"
                >
                  Schedule Class
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mySessions.map((sess) => (
                <div key={sess.id} className="card p-5 space-y-4 border-white/10 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={"badge text-[9px] " + (sess.status === "live" ? "badge-red animate-pulse" : "badge-blue")}>
                        {sess.status === "live" ? "🔴 IN PROGRESS (LIVE MEET)" : "UPCOMING GOOGLE MEET"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{sess.durationMinutes} Mins</span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">{sess.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{sess.description}</p>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Meet Code: <span className="text-white font-bold">{sess.meetingCode || sess.googleMeetUrl}</span></span>
                      <button
                        onClick={() => handleUpdateLiveMeetLink(sess.id, sess.meetingCode)}
                        className="apple-btn-secondary text-[10px] px-2 py-0.5 text-slate-300 hover:text-white cursor-pointer"
                        title="Update with your real Google Meet link or code"
                      >
                        Edit Code
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-semibold">{sess.attendeeCount} Registered</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (sess.status !== "live") startSession(sess.id);
                          launchGoogleMeet(sess.id, trainerId, currentUser?.name, true);
                        }}
                        className="apple-btn-primary text-xs px-3.5 py-2 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-600"
                      >
                        <Video className="w-3.5 h-3.5" /> Launch Official Google Meet ↗
                      </button>
                      <button
                        onClick={() => openClassroom(sess)}
                        className="apple-btn-secondary text-xs px-3 py-2 font-semibold"
                        title="Classroom whiteboard & attendee sync"
                      >
                        Hub
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Managed Courses Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Assigned Courses ({myCourses.length})</h3>
            <Link to="/trainer/courses" className="text-xs text-[#2997ff] hover:underline font-semibold">
              Manage All Courses →
            </Link>
          </div>

          {myCourses.length === 0 ? (
            <div className="card p-10 text-center space-y-3 border-dashed border-white/20">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Assigned Courses Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You haven't authored or been assigned any curriculum modules yet. Create your first course to publish it to students.
              </p>
              <Link to="/trainer/courses" className="apple-btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-semibold">
                Create or Manage Courses →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCourses.map((c) => (
                <div key={c.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge-blue text-[9px]">{c.category}</span>
                      <span className="badge-gray text-[9px]">{c.level}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-2">{c.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{c.resources?.length || 0} Resources</span>
                    <Link to="/trainer/library" className="text-xs text-[#2997ff] font-semibold hover:underline">
                      Upload Slides →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Go Live Prompt & Broadcast Modal */}
      {showInstantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel p-6 max-w-lg w-full border border-white/20 shadow-2xl space-y-4 rounded-2xl bg-[#0b0e18]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Go Live on Google Meet
                    <span className="badge-red text-[8px] uppercase tracking-wider">REAL-TIME BROADCAST</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Generate your room, paste the link, and broadcast to all enrolled students</p>
                </div>
              </div>
              <button onClick={() => setShowInstantModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastInstantMeet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">Select Subject / Enrolled Course</label>
                  <span className="badge-blue text-[9px]">ENGINEERING CURRICULUM</span>
                </div>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="apple-input text-xs"
                >
                  <optgroup label="Popular Subjects" className="bg-slate-900 text-slate-300 font-semibold">
                    <option value="dsa" className="bg-slate-900 text-white">Data Structures & Algorithms (DSA)</option>
                    <option value="web-dev" className="bg-slate-900 text-white">Full-Stack Web Development (Web Dev)</option>
                    <option value="ml" className="bg-slate-900 text-white">Machine Learning & AI (ML)</option>
                    <option value="postgresql" className="bg-slate-900 text-white">PostgreSQL & Database Systems</option>
                  </optgroup>
                  <optgroup label="Cloud, Systems & Security" className="bg-slate-900 text-slate-300 font-semibold">
                    <option value="cloud-k8s" className="bg-slate-900 text-white">Distributed Cloud Systems & Kubernetes</option>
                    <option value="devops" className="bg-slate-900 text-white">DevOps, Docker & CI/CD Pipelines</option>
                    <option value="cybersecurity" className="bg-slate-900 text-white">Cybersecurity & Zero-Trust Defense</option>
                    <option value="system-design" className="bg-slate-900 text-white">System Design & Scalable Architecture</option>
                    <option value="mobile-dev" className="bg-slate-900 text-white">Mobile App Development (Flutter & React Native)</option>
                  </optgroup>
                  {courses.length > 0 && (
                    <optgroup label="Your Assigned LMS Courses" className="bg-slate-900 text-slate-300 font-semibold">
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other" className="bg-slate-900 text-slate-300 font-semibold">
                    <option value="custom" className="bg-slate-900 text-white">Other / Custom Technical Subject</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Lecture Topic / Title</label>
                <input
                  type="text"
                  required
                  className="apple-input text-xs"
                  value={instantMeetTitle}
                  onChange={(e) => setInstantMeetTitle(e.target.value)}
                />
              </div>

              {/* ─── Bulletproof 2-Step Prompt & Broadcast Box ─── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/30 border-2 border-[#2997ff]/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Real-time Broadcast Setup
                  </span>
                  <span className="badge-blue text-[9px]">STEP 1 & 2</span>
                </div>

                {/* Step 1: 1-click open meet.google.com/new to copy */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      Step 1: Open Google Meet
                    </span>
                    <span className="text-[10px] text-slate-400">Creates room instantly</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Click the button below to generate an active Google Meet room in a new tab, then copy its link or 10-letter code:
                  </p>
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-2 transition text-xs shadow-md cursor-pointer"
                    title="Click to open meet.google.com/new in a new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    <span>1-Click: Open Google Meet to Copy Room Link ↗</span>
                  </a>
                </div>

                {/* Step 2: Paste Google Meet link */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1">
                      Step 2: Paste your Google Meet link (e.g. meet.google.com/abc-defg-hij)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="meet.google.com/abc-defg-hij or abc-defg-hij"
                      value={instantMeetUrl}
                      onChange={(e) => setInstantMeetUrl(e.target.value)}
                      className="apple-input text-xs font-mono flex-1 border-blue-400/40 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const clip = await navigator.clipboard.readText();
                          if (clip) setInstantMeetUrl(clip.trim());
                        } catch {}
                      }}
                      className="apple-btn-secondary text-[10px] px-3 py-2 text-blue-300 border-blue-400/30 hover:bg-blue-500/10 cursor-pointer shrink-0 font-semibold"
                      title="Paste link from clipboard"
                    >
                      📋 Paste
                    </button>
                  </div>

                  {/* Real-time Link Validation Status */}
                  {instantMeetUrl.trim() ? (
                    formatGoogleMeet(instantMeetUrl).isReal ? (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Valid Meet Link: <strong>{formatGoogleMeet(instantMeetUrl).url}</strong></span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-300 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <span>⚠️ Please paste a valid meet link or code (e.g. meet.google.com/abc-defg-hij)</span>
                      </div>
                    )
                  ) : (
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Paste your meeting link above so the system can broadcast it to all enrolled students immediately.
                    </p>
                  )}
                </div>
              </div>

              {/* Broadcast CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!formatGoogleMeet(instantMeetUrl).isReal}
                  className={`apple-btn-primary w-full text-xs py-3.5 font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                    formatGoogleMeet(instantMeetUrl).isReal
                      ? "shadow-rose-500/30 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110"
                      : "opacity-60 cursor-not-allowed bg-slate-700"
                  }`}
                >
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span>Broadcast Live Class to All Enrolled Students ↗</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Live Google Meet Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel p-6 max-w-md w-full border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#2997ff]" />
                <h3 className="text-base font-bold text-white">Schedule Google Meet Class</h3>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleScheduleSession} className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Select Subject / Specialization</label>
                  <span className="badge-blue text-[9px]">ENGINEERING CURRICULUM</span>
                </div>
                <select
                  value={scheduleSubjectId}
                  onChange={(e) => handleScheduleSubjectChange(e.target.value)}
                  className="apple-input text-xs"
                >
                  <optgroup label="Popular Subjects" className="bg-slate-900 text-slate-300 font-semibold">
                    <option value="dsa" className="bg-slate-900 text-white">Data Structures & Algorithms (DSA)</option>
                    <option value="web-dev" className="bg-slate-900 text-white">Full-Stack Web Development (Web Dev)</option>
                    <option value="ml" className="bg-slate-900 text-white">Machine Learning & AI (ML)</option>
                    <option value="postgresql" className="bg-slate-900 text-white">PostgreSQL & Database Systems</option>
                  </optgroup>
                  <optgroup label="Cloud, Systems & Security" className="bg-slate-900 text-slate-300 font-semibold">
                    <option value="cloud-k8s" className="bg-slate-900 text-white">Distributed Cloud Systems & Kubernetes</option>
                    <option value="devops" className="bg-slate-900 text-white">DevOps, Docker & CI/CD Pipelines</option>
                    <option value="cybersecurity" className="bg-slate-900 text-white">Cybersecurity & Zero-Trust Defense</option>
                    <option value="system-design" className="bg-slate-900 text-white">System Design & Scalable Architecture</option>
                    <option value="mobile-dev" className="bg-slate-900 text-white">Mobile App Development (Flutter & React Native)</option>
                  </optgroup>
                  {courses.length > 0 && (
                    <optgroup label="Your Assigned LMS Courses" className="bg-slate-900 text-slate-300 font-semibold">
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other" className="bg-slate-900 text-slate-300 font-semibold">
                    <option value="custom" className="bg-slate-900 text-white">Other / Custom Technical Subject</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hands-on Cloud Architecture & Scaling Lab"
                  className="apple-input text-xs"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="apple-input text-xs"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Meeting Room Code (Optional)</label>
                  <span className="badge-blue text-[8px]">AUTO-ALLOCATED INTERNALLY</span>
                </div>
                <input
                  type="text"
                  placeholder="Auto-generated by portal, or enter custom code"
                  className="apple-input text-xs font-mono"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-400">
                  Capacity Connect automatically creates the meeting room. You do not need to open Google Meet or leave this website.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="apple-btn-primary flex-1 text-xs py-2 font-bold cursor-pointer">
                  Publish Google Meet Class
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
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
export default TrainerDashboard;
