import { create } from "zustand";
import type { LiveSession } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, initialLiveSessions } from "../data/seed";

// Helper to generate a genuine 3-4-3 Google Meet room code e.g. "abc-defg-hij"
export const generateMeetCode = (): string => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const p1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  const p2 = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  const p3 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `${p1}-${p2}-${p3}`;
};

// Helper to normalize or parse genuine Google Meet URLs and 10-character room codes
export const formatGoogleMeet = (input?: string): { url: string; code: string; isReal: boolean } => {
  let trimmed = (input || "").trim();
  if (!trimmed) {
    return { url: "https://meet.google.com/new", code: "new", isReal: false };
  }

  // Strip protocol and domain if present
  trimmed = trimmed.replace(/^https?:\/\//i, "");
  trimmed = trimmed.replace(/^meet\.google\.com\//i, "");
  trimmed = trimmed.split("?")[0].replace(/\/+$/, "");

  if (trimmed.toLowerCase() === "new" || !trimmed) {
    return { url: "https://meet.google.com/new", code: "new", isReal: false };
  }

  const clean = trimmed.replace(/\s+/g, "").toLowerCase();
  let formattedCode = clean;
  if (!clean.includes("-") && clean.length === 10) {
    formattedCode = `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`;
  }
  return { url: `https://meet.google.com/${formattedCode}`, code: formattedCode, isReal: true };
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
  deleteSession: (id: string) => void;
  clearCompletedSessions: () => void;
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
  launchGoogleMeet: (sessionId: string, userId?: string, userName?: string, openExternal?: boolean) => void;
  startSession: (id: string) => void;
  endSession: (id: string) => void;
  cancelSession: (id: string) => void;
  openClassroom: (session: LiveSession) => void;
  closeClassroom: () => void;
  joinSession: (sessionId: string, userId: string) => void;
  updateSessionMeetUrl: (sessionId: string, newUrlOrCode: string) => boolean;
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
    // and purge repetitive mock completed sessions from past runs
    if (saved && saved.length > 0) {
      saved = saved.filter(
        (s) =>
          s.id !== "live-01" &&
          s.id !== "live-02" &&
          s.id !== "live-03" &&
          s.trainerName !== "Dr. Marcus Vance" &&
          s.zoomMeetingId !== "982-4512-8874" &&
          !s.meetingCode?.includes("xxx-yyyy-zzz") &&
          s.meetingCode !== "meet.google.com/new" &&
          !(s.status === "completed" && s.title?.includes("Data Structures & Algorithms (DSA) Problem Solving"))
      );
      saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, saved);
    } else {
      saved = initialLiveSessions;
      saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, saved);
    }
    set({ sessions: saved });
  },

  deleteSession: (id: string) => {
    const updated = get().sessions.filter((s) => s.id !== id);
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({
      sessions: updated,
      activeSession: get().activeSession?.id === id ? null : get().activeSession
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_UPDATE" });
        bc.close();
      } catch {}
    }
  },

  clearCompletedSessions: () => {
    const updated = get().sessions.filter((s) => s.status !== "completed");
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({ sessions: updated });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_UPDATE" });
        bc.close();
      } catch {}
    }
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_UPDATE" });
        bc.close();
      } catch {}
    }

    return newSession;
  },

  startInstantMeet: (data) => {
    let customUrl = data.customMeetUrl;
    if (!customUrl && typeof window !== "undefined") {
      const savedDefault = localStorage.getItem("faculty_default_meet_" + data.trainerId);
      if (savedDefault) customUrl = savedDefault;
    }

    const meetDetails = formatGoogleMeet(customUrl);
    if (meetDetails.isReal && typeof window !== "undefined") {
      localStorage.setItem("faculty_default_meet_" + data.trainerId, meetDetails.url);
    }

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
    set({ sessions: updated, activeSession: newSession, isClassroomOpen: false });
    
    // Automatically launch Official Google Meet directly in a dedicated tab for the instructor
    if (typeof window !== "undefined") {
      window.open(meetDetails.url, "_blank", "noopener,noreferrer");
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_STARTED", session: newSession });
        bc.close();
      } catch {}
    }
    return newSession;
  },

  launchGoogleMeet: (sessionId: string, userId?: string, _userName?: string, _openExternal: boolean = true) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return;

    if (userId) {
      get().joinSession(sessionId, userId);
    }

    set({ activeSession: session });

    let targetUrl = session.googleMeetUrl || session.joinUrl;
    let code = session.meetingCode;

    if (!targetUrl || !code || code === "new" || code === "xxx-yyyy-zzz" || targetUrl.includes("xxx-yyyy-zzz") || targetUrl.endsWith("/new")) {
      targetUrl = "https://meet.google.com/new";
    } else {
      if (!targetUrl.startsWith("http")) {
        targetUrl = `https://meet.google.com/${targetUrl}`;
      }
    }

    // Directly launch Official Google Meet in a dedicated window/tab
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  },

  startSession: (id: string) => {
    const session = get().sessions.find((s) => s.id === id);
    let targetMeetUrl = session?.googleMeetUrl;
    let targetCode = session?.meetingCode;
    if (!targetMeetUrl || targetMeetUrl.includes("meet.google.com/new")) {
      const generated = formatGoogleMeet();
      targetMeetUrl = generated.url;
      targetCode = generated.code;
    }

    const updated = get().sessions.map((s) =>
      s.id === id
        ? {
            ...s,
            status: "live" as const,
            googleMeetUrl: targetMeetUrl,
            joinUrl: targetMeetUrl,
            meetingCode: targetCode
          }
        : s
    );
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    const targetSession = updated.find((s) => s.id === id);
    set({
      sessions: updated,
      activeSession: targetSession || get().activeSession
    });

    if (typeof window !== "undefined") {
      if (targetMeetUrl) {
        window.open(targetMeetUrl, "_blank", "noopener,noreferrer");
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_STARTED", sessionId: id });
        bc.close();
      } catch {}
    }
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_ENDED", sessionId: id });
        bc.close();
      } catch {}
    }
  },

  cancelSession: (id: string) => {
    const updated = get().sessions.map((s) =>
      s.id === id ? { ...s, status: "cancelled" as const } : s
    );
    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({ sessions: updated });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_UPDATE" });
        bc.close();
      } catch {}
    }
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

  updateSessionMeetUrl: (sessionId: string, newUrlOrCode: string) => {
    const formatted = formatGoogleMeet(newUrlOrCode);
    if (!formatted.isReal) return false;

    const updated = get().sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          googleMeetUrl: formatted.url,
          joinUrl: formatted.url,
          meetingCode: formatted.code
        };
      }
      return s;
    });

    saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, updated);
    set({
      sessions: updated,
      activeSession: get().activeSession?.id === sessionId
        ? {
            ...get().activeSession!,
            googleMeetUrl: formatted.url,
            joinUrl: formatted.url,
            meetingCode: formatted.code
          }
        : get().activeSession
    });

    if (typeof window !== "undefined") {
      const session = updated.find((s) => s.id === sessionId);
      if (session?.trainerId) {
        localStorage.setItem("faculty_default_meet_" + session.trainerId, formatted.url);
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("capacity_live_session_update"));
      try {
        const bc = new BroadcastChannel("capacity_live_channel");
        bc.postMessage({ type: "LIVE_UPDATE", sessionId, meetUrl: formatted.url, meetingCode: formatted.code });
        bc.close();
      } catch {}
    }
    return true;
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
  const syncFromStorage = () => {
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
  };

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.LIVE_SESSIONS || !event.key) {
      useLiveSessionsStore.getState().load();
    }
  });

  window.addEventListener("capacity_live_session_update", () => {
    useLiveSessionsStore.getState().load();
  });

  try {
    const bc = new BroadcastChannel("capacity_live_channel");
    bc.onmessage = () => {
      useLiveSessionsStore.getState().load();
    };
  } catch {
    // ignore
  }

  // Fast 1.5s background polling heartbeat to guarantee live class status sync across tabs without refreshing
  setInterval(syncFromStorage, 1500);
}


