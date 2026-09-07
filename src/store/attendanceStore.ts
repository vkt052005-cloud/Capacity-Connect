import { create } from "zustand";
import type { SessionAttendance, LessonAttendance } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "../data/seed";
import { dbService } from "../services/db";

interface AttendanceState {
  sessionAttendance: SessionAttendance[];
  lessonAttendance: LessonAttendance[];
  markSessionAttendance: (
    traineeId: string,
    traineeName: string,
    session: { id: string; title: string; courseId: string; courseTitle: string; trainerId: string; trainerName: string }
  ) => void;
  updateSessionLeave: (sessionId: string, traineeId: string) => void;
  markLessonWatched: (
    traineeId: string,
    traineeName: string,
    lesson: { id: string; title: string; courseId: string; courseTitle: string; trainerId: string; trainerName: string },
    completionPercent: number,
    watchDurationSeconds: number
  ) => void;
  getTraineeSessionAttendance: (traineeId: string) => SessionAttendance[];
  getTraineeLessonAttendance: (traineeId: string) => LessonAttendance[];
  getTraineeOverallPercent: (traineeId: string, totalSessions: number, totalLessons: number) => number;
  getSessionAttendees: (sessionId: string) => SessionAttendance[];
  getCourseSessionAttendance: (courseId: string) => SessionAttendance[];
  getCourseLessonAttendance: (courseId: string) => LessonAttendance[];
  getTrainerSessionSummary: (trainerId: string) => { sessionId: string; sessionTitle: string; count: number; date: string }[];
  getAllAttendanceSummary: () => { traineeId: string; traineeName: string; sessionsAttended: number; lessonsWatched: number }[];
  load: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  sessionAttendance: [],
  lessonAttendance: [],

  load: () => {
    try {
      dbService.subscribe("session_attendance", () => {
        dbService.getAll<SessionAttendance>("session_attendance").then((sessions) => {
          if (sessions) set({ sessionAttendance: sessions });
        }).catch(() => {});
      });
      dbService.subscribe("lesson_attendance", () => {
        dbService.getAll<LessonAttendance>("lesson_attendance").then((lessons) => {
          if (lessons) set({ lessonAttendance: lessons });
        }).catch(() => {});
      });
    } catch (e) {}

    Promise.all([
      dbService.getAll<SessionAttendance>("session_attendance"),
      dbService.getAll<LessonAttendance>("lesson_attendance"),
    ])
      .then(([remoteSessions, remoteLessons]) => {
        set({
          sessionAttendance: remoteSessions || [],
          lessonAttendance: remoteLessons || []
        });
      })
      .catch(() => {});
  },

  markSessionAttendance: (traineeId, traineeName, session) => {
    const { sessionAttendance } = get();
    const already = sessionAttendance.find(
      (a) => a.sessionId === session.id && a.traineeId === traineeId
    );
    if (already) return;
    const record: SessionAttendance = {
      id: generateId("satd"),
      sessionId: session.id,
      sessionTitle: session.title,
      courseId: session.courseId,
      courseTitle: session.courseTitle,
      traineeId,
      traineeName,
      trainerId: session.trainerId,
      trainerName: session.trainerName,
      joinedAt: new Date().toISOString(),
      durationMinutes: 0,
      status: "present",
    };
    const updated = [record, ...sessionAttendance];
    saveToStorage(STORAGE_KEYS.SESSION_ATTENDANCE, updated);
    set({ sessionAttendance: updated });
    dbService.create("session_attendance", record).catch(() => {});
  },

  updateSessionLeave: (sessionId, traineeId) => {
    const { sessionAttendance } = get();
    const updated = sessionAttendance.map((a) => {
      if (a.sessionId === sessionId && a.traineeId === traineeId && !a.leftAt) {
        const leftAt = new Date().toISOString();
        const durationMinutes = Math.round(
          (new Date(leftAt).getTime() - new Date(a.joinedAt).getTime()) / 60000
        );
        const status: SessionAttendance["status"] = durationMinutes < 5 ? "late" : "present";
        return { ...a, leftAt, durationMinutes, status };
      }
      return a;
    });
    saveToStorage(STORAGE_KEYS.SESSION_ATTENDANCE, updated);
    set({ sessionAttendance: updated });
    const record = updated.find((a) => a.sessionId === sessionId && a.traineeId === traineeId);
    if (record?.id) {
      dbService
        .update("session_attendance", record.id, {
          leftAt: record.leftAt,
          durationMinutes: record.durationMinutes,
          status: record.status,
        })
        .catch(() => {});
    }
  },

  markLessonWatched: (traineeId, traineeName, lesson, completionPercent, watchDurationSeconds) => {
    const { lessonAttendance } = get();
    const existingIdx = lessonAttendance.findIndex(
      (a) => a.lessonId === lesson.id && a.traineeId === traineeId
    );
    const status: LessonAttendance["status"] =
      completionPercent >= 80 ? "watched" : completionPercent >= 30 ? "partial" : "skipped";

    if (existingIdx !== -1) {
      const existing = lessonAttendance[existingIdx];
      if (completionPercent <= existing.completionPercent) return;
      const updated = lessonAttendance.map((a, i) =>
        i === existingIdx
          ? { ...a, completionPercent, watchDurationSeconds, status, watchedAt: new Date().toISOString() }
          : a
      );
      saveToStorage(STORAGE_KEYS.LESSON_ATTENDANCE, updated);
      set({ lessonAttendance: updated });
      dbService
        .update("lesson_attendance", existing.id, { completionPercent, watchDurationSeconds, status })
        .catch(() => {});
      return;
    }

    const record: LessonAttendance = {
      id: generateId("latd"),
      courseId: lesson.courseId,
      courseTitle: lesson.courseTitle,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      traineeId,
      traineeName,
      trainerId: lesson.trainerId,
      trainerName: lesson.trainerName,
      watchedAt: new Date().toISOString(),
      watchDurationSeconds,
      completionPercent,
      status,
    };
    const updated = [record, ...lessonAttendance];
    saveToStorage(STORAGE_KEYS.LESSON_ATTENDANCE, updated);
    set({ lessonAttendance: updated });
    dbService.create("lesson_attendance", record).catch(() => {});
  },

  getTraineeSessionAttendance: (traineeId) =>
    get().sessionAttendance.filter((a) => a.traineeId === traineeId),

  getTraineeLessonAttendance: (traineeId) =>
    get().lessonAttendance.filter((a) => a.traineeId === traineeId),

  getTraineeOverallPercent: (traineeId, totalSessions, totalLessons) => {
    const sessions = get().sessionAttendance.filter((a) => a.traineeId === traineeId).length;
    const lessons = get().lessonAttendance.filter(
      (a) => a.traineeId === traineeId && a.status === "watched"
    ).length;
    const total = totalSessions + totalLessons;
    if (total === 0) return 0;
    return Math.round(((sessions + lessons) / total) * 100);
  },

  getSessionAttendees: (sessionId) =>
    get().sessionAttendance.filter((a) => a.sessionId === sessionId),

  getCourseSessionAttendance: (courseId) =>
    get().sessionAttendance.filter((a) => a.courseId === courseId),

  getCourseLessonAttendance: (courseId) =>
    get().lessonAttendance.filter((a) => a.courseId === courseId),

  getTrainerSessionSummary: (trainerId) => {
    const records = get().sessionAttendance.filter((a) => a.trainerId === trainerId);
    const map = new Map<string, { sessionId: string; sessionTitle: string; count: number; date: string }>();
    records.forEach((r) => {
      if (!map.has(r.sessionId)) {
        map.set(r.sessionId, { sessionId: r.sessionId, sessionTitle: r.sessionTitle, count: 0, date: r.joinedAt });
      }
      map.get(r.sessionId)!.count += 1;
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getAllAttendanceSummary: () => {
    const { sessionAttendance, lessonAttendance } = get();
    const map = new Map<string, { traineeId: string; traineeName: string; sessionsAttended: number; lessonsWatched: number }>();
    sessionAttendance.forEach((a) => {
      if (!map.has(a.traineeId))
        map.set(a.traineeId, { traineeId: a.traineeId, traineeName: a.traineeName, sessionsAttended: 0, lessonsWatched: 0 });
      map.get(a.traineeId)!.sessionsAttended += 1;
    });
    lessonAttendance.filter((a) => a.status === "watched").forEach((a) => {
      if (!map.has(a.traineeId))
        map.set(a.traineeId, { traineeId: a.traineeId, traineeName: a.traineeName, sessionsAttended: 0, lessonsWatched: 0 });
      map.get(a.traineeId)!.lessonsWatched += 1;
    });
    return Array.from(map.values()).sort(
      (a, b) => (b.sessionsAttended + b.lessonsWatched) - (a.sessionsAttended + a.lessonsWatched)
    );
  },
}));
