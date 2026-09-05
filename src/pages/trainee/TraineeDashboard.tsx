import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Award, Video, CheckCircle2,
  Clock, ArrowRight, Play, Radio,
  ExternalLink, Copy, Check, Calendar, Sparkles
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuthStore } from "../../store/authStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAssessmentsStore } from "../../store/assessmentsStore";
import { useAppStore } from "../../store/appStore";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";

export const TraineeDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { courses, enrollments, certificates } = useCoursesStore();
  const { assessments, attempts } = useAssessmentsStore();
  const { openClassroom, sessions, launchGoogleMeet, joinByMeetUrlOrCode } = useLiveSessionsStore();
  const { setCertificateVerifierOpen, addToast } = useAppStore();
  const navigate = useNavigate();

  const [quickMeetInput, setQuickMeetInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const traineeId = currentUser?.id || "";

  // Real Enrolled courses for this student
  const enrolledCourses = enrollments
    .filter((e) => e.traineeId === traineeId)
    .map((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return course ? { ...course, progress: e.progress, enrollmentId: e.id } : null;
    })
    .filter(Boolean) as (typeof courses[0] & { progress: number; enrollmentId: string })[];

  const completedCount = enrollments.filter((e) => e.traineeId === traineeId && e.progress === 100).length;
  const userCertificates = certificates.filter((c) => c.traineeId === traineeId);
  const enrolledCourseIds = new Set(enrolledCourses.map((c) => c.id));
  const liveSession = sessions.find((s) => s.status === "live");
  const upcomingSession = sessions.find((s) => s.status === "upcoming");
  const activeLiveSession = liveSession || upcomingSession;

  const handleJoinGoogleMeet = (session: typeof activeLiveSession) => {
    if (!session) return;
    openClassroom(session);
    launchGoogleMeet(session.id, currentUser?.id, currentUser?.name);
    addToast({
      title: "Joined Google Meet Classroom",
      message: `Connected to live room. Attendance certified for ${currentUser?.name || "Trainee"}.`,
      type: "success"
    });
  };

  const handleQuickMeetJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickMeetInput.trim();
    if (!query) return;

    const result = joinByMeetUrlOrCode(query, currentUser?.id, currentUser?.name);
    if (result.session) {
      openClassroom(result.session);
    }
    addToast({
      title: "Connecting to Google Meet",
      message: `Opening meeting suite. Attendance logged for ${currentUser?.name || "Trainee"}.`,
      type: "success"
    });
    setQuickMeetInput("");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addToast({ title: "Code Copied", message: `Meeting code ${code} copied to clipboard.`, type: "info" });
  };

  return (
    <DashboardLayout
      pageTitle="Trainee Learning Suite"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Trainee Dashboard" }]}
    >
      <div className="space-y-6">
        {/* Welcome Glass Banner */}
        <div className="glass-panel p-5 border border-white/15 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#0c0f1c] via-[#101426] to-[#0a0d16]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <span className="badge-blue text-[9px] uppercase font-bold tracking-wider">
                Trainee Active
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome back, {currentUser?.name || "Trainee"}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Track your active learning journey, participate in scheduled live Google Meet classes, and complete proctored evaluations.
              </p>
            </div>

            {/* Real Educational Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center min-w-[75px] sm:min-w-[85px]">
                <div className="flex items-center justify-center gap-1 text-[#2997ff] font-bold text-sm sm:text-base">
                  <BookOpen className="w-4 h-4" />
                  <span>{enrolledCourses.length}</span>
                </div>
                <span className="text-[10px] text-slate-400">Enrolled</span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center min-w-[75px] sm:min-w-[85px]">
                <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedCount}</span>
                </div>
                <span className="text-[10px] text-slate-400">Completed</span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center min-w-[75px] sm:min-w-[85px]">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-sm sm:text-base">
                  <Award className="w-4 h-4" />
                  <span>{userCertificates.length}</span>
                </div>
                <span className="text-[10px] text-slate-400">Certificates</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── LIVE GOOGLE MEET ALERT BANNER (If a class is currently Live) ─── */}
        {liveSession && (
          <div className="glass-card p-4 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-[#120a16] to-[#0c0f1c] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden animate-pulse">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="badge-red text-[9px] uppercase font-extrabold tracking-wider animate-pulse">
                    🔴 LIVE CLASS IN PROGRESS
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">{liveSession.courseTitle}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {liveSession.title}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Instructor: <span className="text-white font-semibold">{liveSession.trainerName}</span> • Room Code:{" "}
                  <span className="font-mono text-[#2997ff] font-bold">{liveSession.meetingCode}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleJoinGoogleMeet(liveSession)}
                className="apple-btn-primary text-xs px-4 py-2.5 font-bold flex items-center gap-2 shadow-xl shadow-rose-500/20 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 cursor-pointer"
              >
                <Video className="w-4 h-4" /> Join Google Meet Call ↗
              </button>
              <button
                onClick={() => openClassroom(liveSession)}
                className="apple-btn-secondary text-xs px-3.5 py-2.5 font-semibold cursor-pointer border border-white/20"
                title="Open whiteboard notes and LMS attendance logger"
              >
                Classroom Hub
              </button>
              <Link
                to="/trainee/live-classes"
                className="apple-btn-secondary text-xs px-3 py-2.5 font-semibold text-slate-300"
              >
                All Classes →
              </Link>
            </div>
          </div>
        )}

        {/* ─── PERMANENT GOOGLE MEET HUB & QUICK JOIN (Always Visible) ─── */}
        <div className="glass-panel p-5 border border-white/15 bg-gradient-to-r from-[#0c1020] via-[#0e1428] to-[#0a0d16] rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 text-[#2997ff] flex items-center justify-center">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <span className="badge-blue text-[9px] uppercase font-bold tracking-wider">
                  Google Meet Classroom Hub
                </span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Service Connected
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Live Video Lectures & Interactive Problem Solving
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Attend faculty-led Google Meet lectures, participate in proctored coding labs, and get attendance certified in real-time.
              </p>
            </div>

            {/* In-Place Quick Join Form */}
            <div className="w-full lg:w-auto lg:min-w-[420px] bg-white/[0.04] p-3 rounded-xl border border-white/10 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#2997ff]" /> Quick Join Any Meeting
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Meet Code or URL</span>
              </div>

              <form onSubmit={handleQuickMeetJoin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Meet code (e.g. abc-defg-hij) or URL"
                  value={quickMeetInput}
                  onChange={(e) => setQuickMeetInput(e.target.value)}
                  className="apple-input text-xs py-2 px-3 font-mono placeholder:text-slate-500 flex-1"
                />
                <button
                  type="submit"
                  className="apple-btn-primary text-xs px-4 py-2 font-bold shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" /> Join Call
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <Link to="/trainee/live-classes" className="text-[#2997ff] hover:underline font-semibold flex items-center gap-0.5">
                  View Full Schedule & Classes ({sessions.length}) →
                </Link>
                <a
                  href="https://meet.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 flex items-center gap-1"
                >
                  <span>meet.google.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Upcoming Class Quick Card (if scheduled) */}
          {upcomingSession && !liveSession && (
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge-purple text-[8px] font-bold">NEXT SCHEDULED CLASS</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(upcomingSession.scheduledAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white mt-0.5">{upcomingSession.title} ({upcomingSession.courseTitle})</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleJoinGoogleMeet(upcomingSession)}
                  className="apple-btn-primary text-[11px] px-3 py-1.5 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Video className="w-3 h-3" /> Enter Room
                </button>
                <button
                  onClick={() => openClassroom(upcomingSession)}
                  className="apple-btn-secondary text-[11px] px-3 py-1.5 font-semibold cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enrolled Courses Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Active Learning Programs</h3>
            <Link to="/trainee/courses" className="text-xs text-[#2997ff] hover:underline font-semibold">
              Explore Catalog →
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="card p-10 text-center space-y-3 border-dashed border-white/20">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Courses Enrolled Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You are not enrolled in any learning programs yet. Browse our comprehensive catalog to start learning and earn credentials.
              </p>
              <Link to="/trainee/courses" className="apple-btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-semibold">
                Explore Course Catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((c: any) => (
                <div key={c.id} className="glass-card p-4 space-y-3 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-20 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="badge-blue text-[8px]">{c.category}</span>
                        <span className="text-[10px] text-slate-400">{c.level}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{c.title}</h4>
                      <p className="text-[10px] text-slate-400">Instructor: {c.trainerName}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span>Course Progress</span>
                      <span className="font-bold text-[#2997ff]">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff]"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{c.duration} total</span>
                    <Link
                      to={`/trainee/course/${c.id}`}
                      className="apple-btn-primary text-xs px-3 py-1 font-semibold"
                    >
                      <Play className="w-3 h-3 fill-white" /> Resume Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};
export default TraineeDashboard;
