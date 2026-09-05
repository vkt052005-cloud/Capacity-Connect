import { create } from "zustand";
import type { LiveSession } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, initialLiveSessions } from "../data/seed";

// Helper to normalize or generate genuine Google Meet URLs and 10-character room codes
export const formatGoogleMeet = (input?: string): { url: string; code: string } => {
  const trimmed = (input || "").trim();
  if (!trimmed || trimmed.toLowerCase() === "new") {
    // Official Google Meet instant room allocator URL
    return { url: "https://meet.google.com/new", code: "meet.google.com/new" };
  }

  // Already a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname.replace(/^\/+/, "");
      const code = pathname || trimmed;
      return { url: trimmed, code };
    } catch {
      return { url: trimmed, code: trimmed };
    }
  }

  // Raw code like 'xyz-abcd-efg' or 'xyzabcdefg'
  const clean = trimmed.replace(/\s+/g, "").toLowerCase();
  let formattedCode = clean;
  if (!clean.includes("-") && clean.length === 10) {
    formattedCode = `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  }
  return { url: `https://meet.google.com/${formattedCode}`, code: formattedCode };
};

// Helper to generate a Google Calendar invite URL
export const generateGoogleCalendarLink = (session: {
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetUrl: string;
}): string => {
  try {
    const start = new Date(session.scheduledAt);
    const end = new Date(start.getTime() + (session.durationMinutes || 60) * 60000);
    const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: session.title,
      details: `${session.description}\n\nJoin Live Google Meet: ${session.meetUrl}`,
      location: session.meetUrl,
      dates: `${formatTime(start)}/${formatTime(end)}`
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch {
    return `https://calendar.google.com/calendar/render`;
  }
};

interface LiveSessionsState {
  sessions: LiveSession[];
  activeSession: LiveSession | null;
  isClassroomOpen: boolean;
  load: () => void;
  scheduleSession: (data: Omit<LiveSession, "id" | "attendeeCount" | "attendees">) => LiveSession;
  startInstantMeet: (data: {
    courseId: string;
    courseTitle: string;
    trainerId: string;
    trainerName: string;
    title?: string;
    description?: string;
    customMeetUrl?: string;
  }) => LiveSession;
  launchGoogleMeet: (sessionId: string, userId?: string, userName?: string) => void;
  startSession: (id: string) => void;
  endSession: (id: string) => void;
  cancelSession: (id: string) => void;
  openClassroom: (session: LiveSession) => void;
  closeClassroom: () => void;
  joinSession: (sessionId: string, userId: string) => void;
  findSessionByCode: (code: string) => LiveSession | undefined;
  joinByMeetUrlOrCode: (input: string, userId?: string, userName?: string) => { session: LiveSession | null; targetUrl: string };
}

export const useLiveSessionsStore = create<LiveSessionsState>((set, get) => ({
  sessions: [],
  activeSession: null,
  isClassroomOpen: false,

  load: () => {
    let saved = getFromStorage<LiveSession>(STORAGE_KEYS.LIVE_SESSIONS);
    // Purge any legacy mock / fake sessions ("Dr. Marcus Vance", "live-01", "xxx-yyyy-zzz", etc.)
    if (saved && saved.length > 0) {
      saved = saved.filter(
        (s) =>
          s.id !== "live-01" &&
          s.id !== "live-02" &&
          s.id !== "live-03" &&
          s.trainerName !== "Dr. Marcus Vance" &&
          s.zoomMeetingId !== "982-4512-8874" &&
          !s.meetingCode?.includes("xxx-yyyy-zzz") &&
          s.meetingCode !== "meet.google.com/new"
      );
      saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, saved);
    } else {
      saved = initialLiveSessions;
      saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, saved);
    }
    set({ sessions: saved });
  },

  scheduleSession: (data) => {
    const meetDetails = formatGoogleMeet(data.googleMeetUrl || data.joinUrl || data.meetingCode);
    const scheduledTime = data.scheduledAt || new Date(Date.now() + 3600000).toISOString();
    const duration = data.durationMinutes || 60;
    const calUrl = generateGoogleCalendarLink({
      title: data.title,
      description: data.description || "Live interactive Google Meet lecture.",
      scheduledAt: scheduledTime,
      durationMinutes: duration,
      meetUrl: meetDetails.url
    });

    const newSession: LiveSession = {
      ...data,
      id: "meet-" + Date.now(),
      attendeeCount: 0,
      attendees: [],
      googleMeetUrl: meetDetails.url,
      meetingCode: meetDetails.code,
      joinUrl: meetDetails.url,
      calendarUrl: calUrl,
      platform: "google-meet",
      status: "upcoming"
    };

    const updated = [newSession, ...get().sessions];
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({ sessions: updated });
    return newSession;
  },

  startInstantMeet: (data) => {
    const meetDetails = formatGoogleMeet(data.customMeetUrl);
    const newSession: LiveSession = {
      id: "meet-instant-" + Date.now(),
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      title: data.title || `Live Google Meet: ${data.courseTitle}`,
      description: data.description || "Instant live broadcast lecture hosted on Google Meet.",
      scheduledAt: new Date().toISOString(),
      durationMinutes: 60,
      googleMeetUrl: meetDetails.url,
      meetingCode: meetDetails.code,
      joinUrl: meetDetails.url,
      platform: "google-meet",
      status: "live",
      attendeeCount: 1,
      attendees: [data.trainerId],
      isInstant: true
    };

    const updated = [newSession, ...get().sessions];
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({ sessions: updated, activeSession: newSession, isClassroomOpen: true });
    
    // Only open external window if custom genuine meeting URL was provided
    if (data.customMeetUrl && !data.customMeetUrl.includes("new")) {
      window.open(meetDetails.url, "_blank", "noopener,noreferrer");
    }
    return newSession;
  },

  launchGoogleMeet: (sessionId: string, userId?: string, _userName?: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return;

    if (userId) {
      get().joinSession(sessionId, userId);
    }

    // Always launch the running classroom video suite
    get().openClassroom(session);

    // If an authentic external Google Meet room URL is specified, open it
    const targetUrl = session.googleMeetUrl || session.joinUrl;
    if (
      targetUrl &&
      !targetUrl.includes("xxx-yyyy-zzz") &&
      !targetUrl.endsWith("/new") &&
      !targetUrl.includes("meet.google.com/new") &&
      targetUrl.startsWith("https://meet.google.com/") &&
      targetUrl.length > "https://meet.google.com/".length + 3
    ) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  },

  startSession: (id: string) => {
    const updated = get().sessions.map((s) =>
      s.id === id ? { ...s, status: "live" as const } : s
    );
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    const currentActive = get().activeSession;
    const targetSession = updated.find((s) => s.id === id);
    set({
      sessions: updated,
      activeSession: currentActive?.id === id ? { ...currentActive, status: "live" } : targetSession || currentActive
    });
  },

  endSession: (id: string) => {
    const updated = get().sessions.map((s) =>
      s.id === id ? { ...s, status: "completed" as const } : s
    );
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({
      sessions: updated,
      activeSession: get().activeSession?.id === id ? null : get().activeSession,
      isClassroomOpen: get().activeSession?.id === id ? false : get().isClassroomOpen
    });
  },

  cancelSession: (id: string) => {
    const updated = get().sessions.map((s) =>
      s.id === id ? { ...s, status: "cancelled" as const } : s
    );
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({ sessions: updated });
  },

  openClassroom: (session: LiveSession) => {
    set({
      activeSession: session,
      isClassroomOpen: true
    });
  },

  closeClassroom: () => {
    set({
      activeSession: null,
      isClassroomOpen: false
    });
  },

  joinSession: (sessionId: string, userId: string) => {
    const updated = get().sessions.map((s) => {
      if (s.id === sessionId) {
        const attendees = s.attendees || [];
        if (!attendees.includes(userId)) {
          return {
            ...s,
            attendees: [...attendees, userId],
            attendeeCount: s.attendeeCount + 1
          };
        }
      }
      return s;
    });
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({ sessions: updated });
  },

  findSessionByCode: (code: string) => {
    const clean = code.trim().toLowerCase();
    const normalized = clean.replace(/-/g, "").replace(/\s+/g, "").replace(/^https?:\/\/meet\.google\.com\//, "");
    return get().sessions.find((s) => {
      const matchMeetingCode = s.meetingCode?.toLowerCase().replace(/-/g, "").replace(/\s+/g, "") === normalized;
      const matchMeetUrl = s.googleMeetUrl?.toLowerCase().includes(normalized);
      const matchJoinUrl = s.joinUrl?.toLowerCase().includes(normalized);
      const matchId = s.id.toLowerCase() === normalized;
      return matchMeetingCode || matchMeetUrl || matchJoinUrl || matchId;
    });
  },

  joinByMeetUrlOrCode: (input: string, userId?: string, userName?: string) => {
    const trimmed = input.trim();
    const foundSession = get().findSessionByCode(trimmed);
    if (foundSession) {
      get().launchGoogleMeet(foundSession.id, userId, userName);
      const targetUrl = foundSession.googleMeetUrl || foundSession.joinUrl || `https://meet.google.com/${foundSession.meetingCode}`;
      return { session: foundSession, targetUrl };
    }

    // Direct Google Meet URL or room code
    let directUrl = trimmed;
    if (!directUrl.startsWith("http://") && !directUrl.startsWith("https://")) {
      const cleanCode = trimmed.replace(/\s+/g, "").toLowerCase();
      directUrl = `https://meet.google.com/${cleanCode}`;
    }

    window.open(directUrl, "_blank", "noopener,noreferrer");
    return { session: null, targetUrl: directUrl };
  }
}));

// Real-time multi-tab & multi-window event synchronization
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.LIVE_SESSIONS) {
      useLiveSessionsStore.getState().load();
    }
  });

  // Background polling heartbeat (every 2.5s) to guarantee live class status sync across tabs
  setInterval(() => {
    try {
      const fromStorage = getFromStorage<LiveSession>(STORAGE_KEYS.LIVE_SESSIONS);
      if (fromStorage) {
        const current = useLiveSessionsStore.getState().sessions;
        if (JSON.stringify(fromStorage) !== JSON.stringify(current)) {
          useLiveSessionsStore.setState({ sessions: fromStorage });
        }
      }
    } catch {
      // ignore
    }
  }, 2500);
}


