import React, { useState } from "react";
import {
  Video, Plus, Calendar, Clock, Users, Play,
  CheckCircle2, Radio, Copy, Check, ExternalLink,
  Trash2, X, AlertCircle, Sparkles, BookOpen
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { STANDARD_SUBJECTS, getSubjectById } from "../../data/subjects";
import type { LiveSession } from "../../types";

export const TrainerLiveClasses: React.FC = () => {
  const {
    sessions,
    scheduleSession,
    startInstantMeet,
    launchGoogleMeet,
    startSession,
    endSession,
    cancelSession,
    openClassroom
  } = useLiveSessionsStore();
  const { courses } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const trainerId = currentUser?.id || "";
  const trainerName = currentUser?.name || "Faculty Trainer";
  const myCourses = courses.filter((c) => c.trainerId === trainerId || !c.trainerId);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("dsa");
  const [scheduleSubjectId, setScheduleSubjectId] = useState("dsa");
  const [selectedCourseId, setSelectedCourseId] = useState(myCourses[0]?.id || "c1");
  const [instantMeetTitle, setInstantMeetTitle] = useState(STANDARD_SUBJECTS[0].defaultTitle);
  const [instantMeetUrl, setInstantMeetUrl] = useState("");
  const [sessionTitle, setSessionTitle] = useState(STANDARD_SUBJECTS[0].defaultTitle);
  const [sessionDescription, setSessionDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [platform, setPlatform] = useState<"google-meet" | "in-app">("google-meet");
  const [googleMeetInput, setGoogleMeetInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleOpenInstantModal = () => {
    const sub = getSubjectById(selectedSubjectId) || STANDARD_SUBJECTS[0];
    setSelectedSubjectId(sub.id);
    setInstantMeetTitle(sub.defaultTitle);
    setInstantMeetUrl("");
    setShowInstantModal(true);
  };

  const handleBroadcastInstantMeet = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = getSubjectById(selectedSubjectId);
    const course = courses.find((c) => c.id === selectedSubjectId);
    const subjectName = sub?.name || course?.title || "Specialized Engineering Lab";
    const newSession = startInstantMeet({
      courseId: sub?.id || course?.id || "dsa",
      courseTitle: subjectName,
      trainerId,
      trainerName,
      title: instantMeetTitle.trim() || `Live Google Meet: ${subjectName}`,
      customMeetUrl: instantMeetUrl.trim() || undefined
    });

    setShowInstantModal(false);
    addToast({
      title: "Live Google Meet Broadcasted",
      message: `"${newSession.title}" is now LIVE. Room Code: ${newSession.meetingCode}. Students alerted.`,
      type: "success"
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    const sub = getSubjectById(scheduleSubjectId);
    const course = courses.find((c) => c.id === scheduleSubjectId);
    const subjectName = sub?.name || course?.title || "Specialized Engineering Lab";

    const newSession = scheduleSession({
      courseId: sub?.id || course?.id || "dsa",
      courseTitle: subjectName,
      trainerId,
      trainerName,
      title: sessionTitle.trim(),
      description: sessionDescription.trim() || "Live interactive technical lab, problem-solving, and Q&A session.",
      scheduledAt: scheduledAt || new Date(Date.now() + 3600000).toISOString(),
      durationMinutes: Number(durationMinutes) || 60,
      googleMeetUrl: googleMeetInput.trim() || undefined,
      meetingCode: googleMeetInput.trim() || undefined,
      joinUrl: googleMeetInput.trim() || "https://meet.google.com/new",
      platform,
      status: "upcoming"
    });

    setShowScheduleModal(false);
    setSessionTitle("");
    setSessionDescription("");
    setScheduledAt("");
    setGoogleMeetInput("");

    addToast({
      title: "Google Meet Class Scheduled",
      message: `"${newSession.title}" published. Room Code: ${newSession.meetingCode}`,
      type: "success"
    });
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({ title: "Code Copied", message: `Room code ${code} copied.`, type: "success" });
  };

  // Filter trainer's sessions
  const mySessions = sessions.filter((s) => s.trainerId === trainerId || s.trainerName === trainerName);
  const liveSessions = mySessions.filter((s) => s.status === "live");
  const upcomingSessions = mySessions.filter((s) => s.status === "upcoming");
  const pastSessions = mySessions.filter((s) => s.status === "completed");

  return (
    <DashboardLayout
      pageTitle="Faculty Live Meet Classes"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Trainer Live Classes" }]}
    >
      <div className="space-y-6">

        {/* ─── Hero Header & Action Button ─── */}
        <div className="glass-panel p-6 border border-white/15 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#0c0f1c] via-[#101426] to-[#0a0d16]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="badge-blue text-[10px]">FACULTY BROADCAST HUB</span>
                <span className="text-xs text-slate-400">• {trainerName}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Live Meet Lectures & Proctored Video Labs
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Schedule and launch encrypted live classrooms with in-class code sharing, interactive whiteboard notes, and certified LMS attendance recording.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenInstantModal}
                className="apple-btn-primary text-xs px-4 py-3 font-bold flex items-center gap-2 shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:brightness-110 cursor-pointer"
                title="Immediately create and join a live Google Meet room"
              >
                <Radio className="w-4 h-4 text-rose-300 animate-pulse" /> Start Instant Google Meet
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="apple-btn-secondary text-xs px-4 py-3 font-bold flex items-center gap-2 cursor-pointer border border-white/20 hover:bg-white/10"
              >
                <Plus className="w-4 h-4 text-[#2997ff]" /> Schedule Class
              </button>
            </div>
          </div>
        </div>

        {/* ─── Active Class Now (Instructor Broadcast Controls) ─── */}
        {liveSessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-white tracking-tight">Your Active Live Class</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="glass-card p-5 border-2 border-rose-500/50 bg-rose-950/20 relative space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="badge-red text-[9px] uppercase font-bold tracking-wider animate-pulse flex items-center gap-1">
                          <Radio className="w-3 h-3" /> GOOGLE MEET LIVE
                        </span>
                        <span className="text-[10px] text-slate-400">{session.courseTitle}</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{session.title}</h4>
                      <p className="text-xs text-slate-300">{session.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-300 font-mono">
                      Code: <span className="text-[#2997ff] font-bold">{session.meetingCode}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => launchGoogleMeet(session.id, trainerId, trainerName)}
                        className="apple-btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                        title="Open real Google Meet call in new tab"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Google Meet
                      </button>

                      <button
                        onClick={() => openClassroom(session)}
                        className="apple-btn-secondary text-xs px-3 py-1.5 font-semibold"
                        title="Open notes, whiteboard, and attendee roster"
                      >
                        Classroom Hub
                      </button>

                      <button
                        onClick={() => {
                          endSession(session.id);
                          addToast({ title: "Class Ended", message: "Class completed and attendance finalized.", type: "info" });
                        }}
                        className="apple-btn-danger text-xs px-2.5 py-1.5 font-bold"
                      >
                        End
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Scheduled Upcoming Classes ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Scheduled Classes & Labs</h3>
              <p className="text-xs text-slate-400">Manage upcoming sessions and launch broadcasts</p>
            </div>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="glass-card p-10 text-center space-y-3 border-dashed border-white/15">
              <Video className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-semibold text-white">No Classes Scheduled Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Schedule your first live video lecture to engage with your enrolled trainees in real time.
              </p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="apple-btn-primary text-xs px-4 py-2 font-semibold inline-flex items-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Live Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map((session) => {
                const code = session.meetingCode || session.googleMeetUrl || "Google Meet";
                const formattedDate = new Date(session.scheduledAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={session.id}
                    className="glass-card p-5 border border-white/10 hover:border-[#2997ff]/40 transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="badge-blue text-[9px] uppercase font-bold truncate max-w-[170px]">
                          {session.courseTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {session.durationMinutes}m
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{session.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {session.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Scheduled Date:</span>
                          <span className="text-slate-200 font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Platform:</span>
                          <span className="text-[#2997ff] uppercase text-[10px] font-bold">{session.platform || "in-app"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Room Code:</span>
                          <button
                            onClick={() => copyCode(code, session.id)}
                            className="font-mono text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                          >
                            <span>{code}</span>
                            {copiedId === session.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          startSession(session.id);
                          launchGoogleMeet(session.id, trainerId, trainerName);
                          openClassroom(session);
                          addToast({
                            title: "Google Meet Class Started",
                            message: `Broadcasting "${session.title}". Real Google Meet window opened.`,
                            type: "success"
                          });
                        }}
                        className="apple-btn-primary text-xs px-3.5 py-2 flex-1 font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                        title="Start class and launch Google Meet"
                      >
                        <Video className="w-3.5 h-3.5" /> Start Google Meet
                      </button>

                      {session.calendarUrl && (
                        <a
                          href={session.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition border border-white/10"
                          title="Add to Google Calendar"
                        >
                          <Calendar className="w-4 h-4 text-amber-400" />
                        </a>
                      )}

                      <button
                        onClick={() => {
                          cancelSession(session.id);
                          addToast({ title: "Class Cancelled", message: "Class session cancelled.", type: "info" });
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition border border-white/10"
                        title="Cancel Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Completed Classes Archive ─── */}
        {pastSessions.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Completed Classes Archive</h3>
            <div className="glass-card divide-y divide-white/10 border border-white/10">
              {pastSessions.map((session) => (
                <div key={session.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-white">{session.title}</h5>
                    <p className="text-slate-400">
                      {session.courseTitle} • {session.durationMinutes} min • {session.attendeeCount} Verified Attendees
                    </p>
                  </div>
                  <span className="badge-green text-[10px] self-start sm:self-auto">Completed & Logged</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── Instant Google Meet Modal ─── */}
      {showInstantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel p-6 border border-white/20 shadow-2xl space-y-4 rounded-2xl bg-[#0b0e18]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#2997ff] flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Start Instant Google Meet Class</h3>
                  <p className="text-[11px] text-slate-400">Launch an authentic Google Meet room and broadcast to students</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstantModal(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastInstantMeet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">Select Subject / Specialization</label>
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

              {/* Step 1: Open Google Meet Room */}
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-[#2997ff] flex items-center justify-center text-[10px]">1</span>
                    Create Room on Google Cloud
                  </span>
                  <span className="badge-blue text-[8px]">REQUIRED ONCE</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Click below to open Google's official meeting allocator. Google will create a live video room and copy its link to your clipboard.
                </p>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-btn-secondary w-full text-xs py-2 font-bold flex items-center justify-center gap-2 border border-[#2997ff]/40 text-[#2997ff] hover:bg-[#2997ff]/10 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open meet.google.com/new in New Tab ↗</span>
                </a>
              </div>

              {/* Step 2: Paste Room Code */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">2</span>
                  Paste Room Link or 10-Letter Code
                </span>
                <input
                  type="text"
                  placeholder="e.g. meet.google.com/abc-defg-hij or abc-defg-hij"
                  value={instantMeetUrl}
                  onChange={(e) => setInstantMeetUrl(e.target.value)}
                  className="apple-input text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  (Or leave blank to launch directly with meet.google.com/new)
                </p>
              </div>

              {/* Step 3: Broadcast */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="apple-btn-primary w-full text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:brightness-110 cursor-pointer text-sm"
                >
                  <Radio className="w-4 h-4 text-rose-300 animate-pulse" />
                  <span>3. Broadcast Live Class to All Students</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Schedule Class Modal ─── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#2997ff]" />
                <h3 className="text-base font-bold text-white">Schedule Live Meet Class</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Select Subject / Specialization</label>
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Lecture Topic / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Sharding & Failover Lab"
                  className="apple-input text-xs"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Lecture Agenda / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the topics, live code demonstrations, and learning goals..."
                  className="apple-input text-xs resize-none"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Date & Start Time</label>
                  <input
                    type="datetime-local"
                    className="apple-input text-xs"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="apple-input text-xs"
                  >
                    <option value={30} className="bg-slate-900 text-white">30 Minutes</option>
                    <option value={45} className="bg-slate-900 text-white">45 Minutes</option>
                    <option value={60} className="bg-slate-900 text-white">60 Minutes (Standard)</option>
                    <option value={90} className="bg-slate-900 text-white">90 Minutes</option>
                    <option value={120} className="bg-slate-900 text-white">120 Minutes (Full Lab)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Classroom Platform</label>
                  <span className="badge-blue text-[9px] uppercase font-bold">Standard Infrastructure</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform("google-meet")}
                    className={"p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 " + (platform === "google-meet" ? "bg-[#0071e3] text-white border-[#2997ff] shadow-md" : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white")}
                  >
                    <Video className="w-3.5 h-3.5" /> Google Meet (Official)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform("in-app")}
                    className={"p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 " + (platform === "in-app" ? "bg-[#0071e3] text-white border-[#2997ff] shadow-md" : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white")}
                  >
                    In-Portal Classroom Hub
                  </button>
                </div>
              </div>

              {platform === "google-meet" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">Google Meet Link / Room Code</label>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      Create Room on Meet <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/xxx-yyyy-zzz or xxx-yyyy-zzz"
                    className="apple-input text-xs font-mono"
                    value={googleMeetInput}
                    onChange={(e) => setGoogleMeetInput(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Leave blank to auto-create an official Google Meet room. Trainees will receive this verified link.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="apple-btn-secondary text-xs px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary text-xs px-5 py-2 font-bold"
                >
                  Publish Live Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default TrainerLiveClasses;
