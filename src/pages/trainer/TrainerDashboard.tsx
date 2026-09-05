import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Users, Award, Video, Plus, CheckSquare,
  BarChart3, Sparkles, FolderOpen, Calendar, Clock, Radio,
  ExternalLink, X
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useAppStore } from "../../store/appStore";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
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
    openClassroom
  } = useLiveSessionsStore();
  const { addToast } = useAppStore();
  const trainerId = currentUser?.id || "";
  const myCourses = courses.filter((c) => c.trainerId === trainerId);
  const mySessions = sessions.filter((s) => s.trainerId === trainerId || s.trainerName === currentUser?.name);
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
    setInstantMeetTitle(sub.defaultTitle);
    setInstantMeetUrl("");
    setShowInstantModal(true);
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
    const sub = getSubjectById(selectedSubjectId);
    const course = courses.find((c) => c.id === selectedSubjectId);
    const subjectName = sub?.name || course?.title || "Specialized Engineering Lab";
    const newSess = startInstantMeet({
      courseId: sub?.id || course?.id || "dsa",
      courseTitle: subjectName,
      trainerId,
      trainerName: currentUser?.name || "Faculty Trainer",
      title: instantMeetTitle.trim() || `Live Google Meet: ${subjectName}`,
      customMeetUrl: instantMeetUrl.trim() || undefined
    });

    setShowInstantModal(false);
    addToast({
      title: "Google Meet Class Broadcasted Live",
      message: `"${newSess.title}" is now LIVE for ${subjectName}.`,
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
                  className="apple-btn-primary text-xs px-4 py-2 font-semibold cursor-pointer"
                >
                  Start Instant Google Meet
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
                      <span className="text-[#2997ff] uppercase">{sess.platform || "Google Meet"}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-semibold">{sess.attendeeCount} Registered</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (sess.status !== "live") startSession(sess.id);
                          launchGoogleMeet(sess.id, trainerId, currentUser?.name);
                        }}
                        className="apple-btn-primary text-xs px-3.5 py-2 font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Meet Call
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

      {/* Start Instant Google Meet Modal */}
      {showInstantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="glass-panel p-6 max-w-lg w-full border border-white/20 shadow-2xl space-y-4 rounded-2xl bg-[#0b0e18]">
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
              <button onClick={() => setShowInstantModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
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
                  <label className="block text-xs font-semibold text-slate-300">Google Meet Link / Code</label>
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    Create on Meet <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="text"
                  placeholder="https://meet.google.com/xxx-yyyy-zzz or xxx-yyyy-zzz"
                  className="apple-input text-xs font-mono"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                />
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
