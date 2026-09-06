import React, { useState, useEffect, useRef } from "react";
import { Radio, Video, X, ShieldCheck, Volume2, Bell } from "lucide-react";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { isStudentEnrolledInTeacherCourse } from "../../utils/liveMeetEnrollment";

/**
 * Web Audio API synthesizer buzzer / chime alert
 * Plays a pleasant, high-visibility dual-tone broadcast alert without requiring external MP3 files.
 */
function playLiveClassBuzzer() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: 587.33Hz (D5) -> 880Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: 880Hz (A5) -> 1174.66Hz (D6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.45);
    gain2.gain.setValueAtTime(0.25, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.6);
  } catch (e) {
    // Autoplay restrictions are gracefully handled
  }
}

export const GlobalLiveClassBanner: React.FC = () => {
  const { sessions, launchGoogleMeet } = useLiveSessionsStore();
  const { courses, enrollments } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(null);
  const [showAutoJoinPopup, setShowAutoJoinPopup] = useState<boolean>(true);
  const buzzedSessionsRef = useRef<Set<string>>(new Set());

  const liveSessions = sessions.filter((s) => s.status === "live");
  if (liveSessions.length === 0) {
    return null;
  }

  // If user is a student (trainee): MUST be enrolled in that teacher's course to see and join!
  let liveSession = liveSessions[0];
  if (currentUser?.role === "trainee") {
    const enrolledSession = liveSessions.find((s) =>
      isStudentEnrolledInTeacherCourse(currentUser.id, s, courses, enrollments)
    );
    if (!enrolledSession) {
      // Not enrolled in any live teacher's course: do not display banner
      return null;
    }
    liveSession = enrolledSession;
  }

  // Trigger audio chime / buzzer when a new live session is detected
  useEffect(() => {
    if (liveSession && !buzzedSessionsRef.current.has(liveSession.id)) {
      buzzedSessionsRef.current.add(liveSession.id);
      playLiveClassBuzzer();
      setShowAutoJoinPopup(true);
    }
  }, [liveSession?.id]);

  if (!liveSession || liveSession.id === dismissedSessionId) {
    return null;
  }

  const isHost = currentUser?.id === liveSession.trainerId;

  const handleJoin = () => {
    launchGoogleMeet(liveSession.id, currentUser?.id, currentUser?.name, true);
    addToast({
      title: "Opening Google Meet Room",
      message: `Redirecting to ${liveSession.trainerName}'s live class (Code: ${liveSession.meetingCode}). Attendance certified.`,
      type: "success"
    });
  };

  return (
    <>
      {/* ─── High-Priority Sticky Live Buzzer Banner ─── */}
      <aside
        aria-label="Live Class Announcement"
        className="sticky top-16 sm:top-20 z-30 w-full bg-gradient-to-r from-rose-950/95 via-[#1a0814]/95 to-[#0b0f24]/95 border-b border-rose-500/40 backdrop-blur-2xl shadow-[0_10px_30px_rgba(225,29,72,0.25)] animate-fadeIn"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="w-4 h-4 rounded-full bg-rose-500 animate-ping absolute opacity-75" />
              <span className="w-3 h-3 rounded-full bg-rose-500 relative flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 shrink-0 shadow-sm">
                  <Radio className="w-3 h-3 animate-pulse text-rose-400" />
                  <Bell className="w-3 h-3 text-amber-300 animate-bounce" />
                  TEACHER IS LIVE NOW
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {liveSession.courseTitle}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Enrolled Access Granted
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                <span className="text-rose-300 font-semibold">{liveSession.trainerName}</span> is broadcast live on Google Meet:{" "}
                <span className="text-white font-medium">"{liveSession.title}"</span>{" "}
                <span className="text-slate-400 font-mono text-[11px]">(Code: {liveSession.meetingCode})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => playLiveClassBuzzer()}
              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer text-[11px] flex items-center gap-1"
              title="Replay broadcast buzzer chime"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Buzzer</span>
            </button>

            <button
              onClick={handleJoin}
              className="apple-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/40 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 cursor-pointer text-white transition transform hover:scale-[1.02]"
              title="Redirect directly to Google Meet room of your teacher"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isHost ? "Open Google Meet (Host) ↗" : "Join Google Meet (1-Click) ↗"}</span>
            </button>

            <button
              onClick={() => setDismissedSessionId(liveSession.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Auto-Joining Floating Alert Card (for Trainees when teacher broadcasts) ─── */}
      {!isHost && showAutoJoinPopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-[#120817]/95 border-2 border-rose-500/50 backdrop-blur-2xl shadow-[0_20px_50px_rgba(225,29,72,0.35)] animate-slideUp text-white space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-rose-400 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  Live Classroom Broadcast Alert
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {liveSession.trainerName} is LIVE!
                </h4>
              </div>
            </div>
            <button
              onClick={() => setShowAutoJoinPopup(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1 text-xs">
            <p className="font-semibold text-slate-200 truncate">{liveSession.title}</p>
            <p className="text-[11px] text-slate-400">
              Course: <strong className="text-white">{liveSession.courseTitle}</strong>
            </p>
            <p className="text-[11px] font-mono text-emerald-400">
              Meet Code: <strong>{liveSession.meetingCode}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setShowAutoJoinPopup(false);
                handleJoin();
              }}
              className="apple-btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Join Class Now ↗</span>
            </button>
            <button
              onClick={() => setShowAutoJoinPopup(false)}
              className="apple-btn-secondary py-2.5 px-3 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

