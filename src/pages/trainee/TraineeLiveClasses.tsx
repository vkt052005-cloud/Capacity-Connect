import React, { useState } from "react";
import {
  Video, Calendar, Clock, Users, ArrowRight, Play,
  CheckCircle2, Radio, Search, Shield, Copy, Check,
  ExternalLink, Sparkles, BookOpen, AlertCircle
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";

export const TraineeLiveClasses: React.FC = () => {
  const { sessions, openClassroom, findSessionByCode, launchGoogleMeet } = useLiveSessionsStore();
  const { courses, enrollments } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [meetingCodeInput, setMeetingCodeInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const traineeId = currentUser?.id || "";
  const enrolledCourseIds = new Set(
    enrollments.filter((e) => e.traineeId === traineeId).map((e) => e.courseId)
  );

  const handleJoinSession = (session: typeof sessions[0]) => {
    openClassroom(session);
    launchGoogleMeet(session.id, traineeId, currentUser?.name);
    addToast({
      title: "Joined Google Meet Classroom",
      message: `Connected to "${session.title}". Live attendance certified for ${currentUser?.name || "Student"}.`,
      type: "success"
    });
  };

  // Quick Join handler (for optional manual codes)
  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = meetingCodeInput.trim();
    if (!query) return;

    const session = findSessionByCode(query);
    if (session) {
      handleJoinSession(session);
      setMeetingCodeInput("");
    } else if (query.includes("meet.google.com/") || query.replace(/-/g, "").length === 10) {
      const targetUrl = query.startsWith("http") ? query : `https://meet.google.com/${query}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      addToast({
        title: "Connecting to Google Meet",
        message: `Opening room ${query}...`,
        type: "info"
      });
      setMeetingCodeInput("");
    } else {
      addToast({
        title: "Meeting Not Found",
        message: "No live or scheduled class matches this code. Please verify the Google Meet code.",
        type: "error"
      });
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({ title: "Code Copied", message: `Meeting code ${code} copied.`, type: "success" });
  };

  // Filter sessions
  const liveSessions = sessions.filter((s) => s.status === "live");
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const pastSessions = sessions.filter((s) => s.status === "completed");
  const primaryLive = liveSessions[0];

  const filteredUpcoming = upcomingSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.trainerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      pageTitle="Live Meet Lectures & Classes"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Live Meet Classes" }]}
    >
      <div className="space-y-6">

        {/* ─── Hero Banner & Live Detection Panel ─── */}
        <div className="glass-panel p-6 border border-white/15 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#0c0f1c] via-[#10152b] to-[#0a0d16]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="badge-blue text-[10px] uppercase font-bold tracking-wider">
                  Interactive Classrooms
                </span>
                <span className="text-xs text-slate-400">• High-Definition Video & Audio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Live Meet Lectures & Proctored Labs
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Join live interactive video lectures with faculty, participate in code walkthroughs, ask questions in real-time, and get your attendance certified automatically.
              </p>
            </div>

            {/* Dynamic Status / 1-Click Join Box */}
            {primaryLive ? (
              /* ACTIVE LIVE BROADCAST: Zero-Link 1-Click Join */
              <div className="w-full lg:w-[420px] glass-card p-5 border-2 border-rose-500/60 bg-gradient-to-br from-rose-950/50 via-[#101428]/90 to-[#0a0d16] space-y-3.5 shrink-0 shadow-[0_0_35px_rgba(244,63,94,0.25)] relative overflow-hidden animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="badge-red text-[9px] uppercase font-black tracking-wider animate-pulse flex items-center gap-1">
                      <Radio className="w-3 h-3" /> TEACHER IS LIVE NOW
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Room Active
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-rose-300 font-medium truncate">
                    {primaryLive.courseTitle}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2">
                    {primaryLive.title}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Instructor: <span className="text-white font-semibold">{primaryLive.trainerName}</span>
                  </p>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    onClick={() => handleJoinSession(primaryLive)}
                    className="apple-btn-primary w-full text-xs py-3 font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 cursor-pointer text-white tracking-wide transition-all transform hover:scale-[1.02]"
                    title="Connect immediately to live Google Meet call (no link or code required)"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Meet Now (1-Click • No Code Needed) ↗</span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                    <button
                      onClick={() => openClassroom(primaryLive)}
                      className="hover:text-white transition flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                    >
                      Open Classroom Hub & Notes
                    </button>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" /> Attendance Certified
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* NO ACTIVE BROADCAST: Auto-Listening Radar */
              <div className="w-full lg:w-[390px] glass-card p-4 border border-white/15 bg-white/[0.03] space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#2997ff]" /> Faculty Broadcast Radar
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Radar Active</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <p className="text-xs text-slate-200 font-medium">
                    Listening for faculty broadcasts...
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When your teacher starts a live Google Meet class, it will automatically appear here with a 1-click join button. No meeting link or code needed.
                  </p>
                </div>

                <div className="pt-1">
                  {!showManualInput ? (
                    <button
                      type="button"
                      onClick={() => setShowManualInput(true)}
                      className="text-[11px] text-[#2997ff] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Have a private unlisted code? Enter manually ▾</span>
                    </button>
                  ) : (
                    <form onSubmit={handleQuickJoin} className="space-y-2 pt-2 border-t border-white/10 animate-fadeIn">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Google Meet code (e.g. abc-defg-hij)"
                          className="apple-input text-xs py-2 font-mono flex-1"
                          value={meetingCodeInput}
                          onChange={(e) => setMeetingCodeInput(e.target.value)}
                        />
                        <button type="submit" className="apple-btn-primary text-xs px-3.5 py-2 font-bold shrink-0">
                          Join
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Direct Google Meet connector</span>
                        <button
                          type="button"
                          onClick={() => setShowManualInput(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          Hide
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Active Live Classes (Happening Right Now) ─── */}
        {liveSessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-white tracking-tight">Happening Right Now (Live Faculty Lectures)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="glass-card p-5 border-2 border-rose-500/50 relative overflow-hidden bg-gradient-to-br from-rose-950/30 via-[#0d101a] to-slate-950/50 space-y-4 shadow-xl shadow-rose-950/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="badge-red text-[9px] uppercase font-bold tracking-wider animate-pulse flex items-center gap-1">
                          <Radio className="w-3 h-3" /> LIVE NOW
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{session.courseTitle}</span>
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">{session.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2">{session.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/10 gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-slate-400">Instructor: <span className="text-white font-semibold">{session.trainerName}</span></div>
                      <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Attendance Auto-Certified
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleJoinSession(session)}
                        className="apple-btn-primary text-xs px-4 py-2 font-bold shadow-lg shadow-rose-600/25 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                        title="Join Google Meet immediately without typing code"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Meet (1-Click) ↗
                      </button>
                      <button
                        onClick={() => openClassroom(session)}
                        className="apple-btn-secondary text-xs px-3 py-2 font-semibold cursor-pointer border border-white/20"
                        title="Open notes, whiteboard, and attendee roster"
                      >
                        Classroom Hub
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Search & Upcoming Lectures ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Scheduled Live Classes</h3>
              <p className="text-xs text-slate-400">Upcoming interactive Google Meet lectures with faculty instructors</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lectures or faculty..."
                className="apple-input text-xs pl-9 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredUpcoming.length === 0 ? (
            <div className="glass-card p-10 text-center space-y-3 border-dashed border-white/15">
              <Video className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-semibold text-white">No Upcoming Classes Scheduled</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Check back soon or enroll in more courses to receive automatic live lecture invites from faculty.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUpcoming.map((session) => {
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
                        <span className="badge-blue text-[9px] uppercase font-bold truncate max-w-[180px]">
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

                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Scheduled For:</span>
                          <span className="text-slate-200 font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Instructor:</span>
                          <span className="text-[#2997ff] font-medium">{session.trainerName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Meet Room Code:</span>
                          <button
                            onClick={() => copyCode(code, session.id)}
                            className="font-mono text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                            title="Click to copy"
                          >
                            <span>{code}</span>
                            {copiedId === session.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleJoinSession(session)}
                        className="apple-btn-primary text-xs px-3.5 py-2 flex-1 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Meet Call
                      </button>

                      <button
                        onClick={() => openClassroom(session)}
                        className="apple-btn-secondary text-xs px-2.5 py-2 cursor-pointer"
                        title="Classroom whiteboard & notes"
                      >
                        Hub
                      </button>

                      {session.calendarUrl && (
                        <a
                          href={session.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="apple-btn-secondary text-xs p-2 shrink-0 text-amber-400"
                          title="Add to Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Past Recorded Lectures Archive ─── */}
        {pastSessions.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Archived & Completed Lectures</h3>
            <div className="glass-card divide-y divide-white/10 border border-white/10">
              {pastSessions.map((session) => (
                <div key={session.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-white">{session.title}</h5>
                    <p className="text-slate-400">
                      {session.courseTitle} • Instructor: {session.trainerName} • {session.durationMinutes} min
                    </p>
                  </div>
                  <span className="badge-gray text-[10px] self-start sm:self-auto">Completed</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TraineeLiveClasses;
