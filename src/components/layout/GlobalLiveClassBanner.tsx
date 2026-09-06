import React, { useState } from "react";
import { Radio, Video, X, ShieldCheck } from "lucide-react";
import { useLiveSessionsStore } from "../../store/liveSessionsStore";
import { useCoursesStore } from "../../store/coursesStore";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { isStudentEnrolledInTeacherCourse } from "../../utils/liveMeetEnrollment";

export const GlobalLiveClassBanner: React.FC = () => {
  const { sessions, launchGoogleMeet } = useLiveSessionsStore();
  const { courses, enrollments } = useCoursesStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useAppStore();
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(null);

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

  if (!liveSession || liveSession.id === dismissedSessionId) {
    return null;
  }

  const isHost = currentUser?.id === liveSession.trainerId;

  const handleJoin = () => {
    launchGoogleMeet(liveSession.id, currentUser?.id, currentUser?.name, true);
    addToast({
      title: "Opening Google Meet Room",
      message: `Redirecting to ${liveSession.trainerName}'s class (Code: ${liveSession.meetingCode}). Attendance certified.`,
      type: "success"
    });
  };

  return (
    <aside
      aria-label="Live Class Announcement"
      className="sticky top-16 sm:top-20 z-30 w-full bg-gradient-to-r from-rose-950/95 via-[#1a0814]/95 to-[#0b0f24]/95 border-b border-rose-500/40 backdrop-blur-2xl shadow-[0_10px_30px_rgba(225,29,72,0.25)] animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center gap-1 shrink-0">
                <Radio className="w-3 h-3 animate-pulse" /> TEACHER IS LIVE NOW
              </span>
              <span className="text-xs font-bold text-white truncate">
                {liveSession.courseTitle}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Enrolled Access Granted
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate">
              <span className="text-rose-300 font-semibold">{liveSession.trainerName}</span> is live on Google Meet:{" "}
              <span className="text-white font-medium">"{liveSession.title}"</span>{" "}
              <span className="text-slate-400 font-mono text-[11px]">(Code: {liveSession.meetingCode})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={handleJoin}
            className="apple-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 cursor-pointer text-white transition transform hover:scale-[1.02]"
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
  );
};

