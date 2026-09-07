import { create } from "zustand";
import type { Course, Enrollment, Certificate, Resource, Feedback } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "../data/seed";
import { dbService } from "../services/db";
import { deleteVideoBlob } from "../utils/videoStorage";

const getDeletedCourseIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_COURSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
};

interface CoursesState {
  courses: Course[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  feedbacks: Feedback[];
  isSubscribed: boolean;
  load: () => void;
  initSubscription: () => void;
  enroll: (traineeId: string, courseId: string) => void;
  unenroll: (traineeId: string, courseId: string) => void;
  updateProgress: (enrollmentId: string, progress: number) => void;
  completeCourse: (
    traineeId: string,
    courseId: string,
    grade?: string,
    scorePercentage?: number,
    certData?: Partial<Certificate>
  ) => Certificate | undefined;
  addResource: (resource: Resource) => void;
  deleteResource: (courseId: string, resourceId: string) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addFeedback: (fb: Feedback) => void;
  deleteFeedback: (feedbackId: string) => void;
  getCourseFeedbacks: (courseId: string) => Feedback[];
  getTrainerFeedbacks: (trainerId: string) => Feedback[];
  isEnrolled: (traineeId: string, courseId: string) => boolean;
  getEnrollment: (traineeId: string, courseId: string) => Enrollment | undefined;
  getTraineeCertificates: (traineeId: string) => Certificate[];
  getTrainerCourses: (trainerId: string) => Course[];
}

const sanitizeCourses = (courses: Course[], feedbacks: Feedback[] = []): Course[] => {
  const deletedIds = getDeletedCourseIds();
  const seenIds = new Set<string>();
  const seenTitleTrainer = new Set<string>();

  return (courses || [])
    .filter((c) => {
      if (!c || !c.id) return false;
      if (deletedIds.has(c.id)) return false;
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);

      const titleKey = `${c.trainerId || c.trainerName || ""}_${(c.title || "").trim().toLowerCase()}`;
      if (c.title && c.title.trim() && seenTitleTrainer.has(titleKey)) return false;
      if (c.title && c.title.trim()) seenTitleTrainer.add(titleKey);

      if (["c1", "c2", "c3", "c4", "c5"].includes(c.id)) return false;
      const trainer = (c.trainerName || "").toLowerCase();
      if (trainer.includes("marcus vance") || trainer.includes("sarah chen") || trainer.includes("rajesh kumar")) return false;
      const title = (c.title || "").toLowerCase();
      if (
        title.includes("advanced cloud infrastructure") ||
        title.includes("generative ai & llm systems") ||
        title.includes("strategic leadership") ||
        title.includes("cybersecurity governance") ||
        title.includes("executive communication")
      ) return false;
      return true;
    })
    .map((c) => {
      const courseFbs = feedbacks.filter((f) => f && f.courseId === c.id);
      if (courseFbs.length > 0) {
        const sum = courseFbs.reduce((acc, f) => acc + (f.rating || 0), 0);
        return {
          ...c,
          rating: Number((sum / courseFbs.length).toFixed(1)),
          totalRatings: courseFbs.length
        };
      }
      return {
        ...c,
        rating: 0,
        totalRatings: 0
      };
    });
};

const sanitizeEnrollments = (enrollments: Enrollment[]): Enrollment[] => {
  const deletedIds = getDeletedCourseIds();
  return (enrollments || []).filter((e) => {
    if (!e || !e.courseId) return false;
    if (deletedIds.has(e.courseId)) return false;
    if (["c1", "c2", "c3", "c4", "c5"].includes(e.courseId)) return false;
    return true;
  });
};

const sanitizeFeedbacks = (feedbacks: Feedback[]): Feedback[] => {
  const deletedIds = getDeletedCourseIds();
  return (feedbacks || []).filter((f) => {
    if (!f || !f.id) return false;
    if (f.courseId && deletedIds.has(f.courseId)) return false;
    if (["fb-1", "fb-2", "fb-3", "fb-4"].includes(f.id)) return false;
    const comment = (f.comment || "").toLowerCase();
    if (
      comment.includes("world-class") ||
      comment.includes("pointers and memory management concepts were explained") ||
      comment.includes("concise yet powerful lectures on normalization") ||
      comment.includes("outstanding roadmap for binary trees")
    ) {
      return false;
    }
    return true;
  });
};

const sanitizeCertificates = (certificates: Certificate[]): Certificate[] => {
  const deletedIds = getDeletedCourseIds();
  return (certificates || []).filter((c) => {
    if (!c || !c.courseId) return false;
    if (deletedIds.has(c.courseId)) return false;
    return true;
  });
};

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  enrollments: [],
  certificates: [],
  feedbacks: [],
  isSubscribed: false,

  initSubscription: () => {
    if (get().isSubscribed) return;
    set({ isSubscribed: true });

    // Real-time server sync listeners for courses, enrollments, feedbacks, certificates
    const refreshAll = async () => {
      try {
        const [cloudCourses, cloudEnrollments, cloudFeedbacks, cloudCertificates] = await Promise.all([
          dbService.getAll<Course>("courses"),
          dbService.getAll<Enrollment>("enrollments"),
          dbService.getAll<Feedback>("feedbacks"),
          dbService.getAll<Certificate>("certificates"),
        ]);

        const validFeedbacks = sanitizeFeedbacks(cloudFeedbacks || []);
        const validCourses = sanitizeCourses(cloudCourses || [], validFeedbacks);
        const validEnrollments = sanitizeEnrollments(cloudEnrollments || []);
        const validCertificates = sanitizeCertificates(cloudCertificates || []);

        set({
          courses: validCourses,
          enrollments: validEnrollments,
          feedbacks: validFeedbacks,
          certificates: validCertificates,
        });
      } catch (err) {
        console.warn("Could not sync courses from cloud:", err);
      }
    };

    dbService.subscribe("courses", () => refreshAll());
    dbService.subscribe("enrollments", () => refreshAll());
    dbService.subscribe("feedbacks", () => refreshAll());
    dbService.subscribe("certificates", () => refreshAll());
  },

  load: () => {
    get().initSubscription();

    Promise.all([
      dbService.getAll<Course>("courses"),
      dbService.getAll<Enrollment>("enrollments"),
      dbService.getAll<Feedback>("feedbacks"),
      dbService.getAll<Certificate>("certificates")
    ]).then(([srvCourses, srvEnrollments, srvFeedbacks, srvCertificates]) => {
      const activeFeedbacks = sanitizeFeedbacks(srvFeedbacks || []);
      const activeCourses = sanitizeCourses(srvCourses || [], activeFeedbacks);
      const activeEnrollments = sanitizeEnrollments(srvEnrollments || []);
      const activeCertificates = sanitizeCertificates(srvCertificates || []);

      set({
        courses: activeCourses,
        enrollments: activeEnrollments,
        feedbacks: activeFeedbacks,
        certificates: activeCertificates
      });
    }).catch(() => {});
  },

  enroll: (traineeId, courseId) => {
    const { enrollments } = get();
    const already = enrollments.find((e) => e.traineeId === traineeId && e.courseId === courseId);
    if (already) return;
    const newEnrollment: Enrollment = {
      id: generateId("enr"),
      traineeId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0
    };
    const updated = [...enrollments, newEnrollment];
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
    set({ enrollments: updated });
    dbService.create("enrollments", newEnrollment).catch(() => {});
  },

  unenroll: (traineeId, courseId) => {
    const { enrollments } = get();
    const target = enrollments.find((e) => e.traineeId === traineeId && e.courseId === courseId);
    const updated = enrollments.filter((e) => !(e.traineeId === traineeId && e.courseId === courseId));
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
    set({ enrollments: updated });
    if (target?.id) {
      dbService.remove("enrollments", target.id).catch(() => {});
    }
  },

  updateProgress: (enrollmentId, progress) => {
    const { enrollments } = get();
    const updated = enrollments.map((e) => (e.id === enrollmentId ? { ...e, progress } : e));
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
    set({ enrollments: updated });
    dbService.update("enrollments", enrollmentId, { progress }).catch(() => {});
  },

  completeCourse: (traineeId, courseId, grade, scorePercentage, certData) => {
    const { enrollments, certificates, courses } = get();
    const updated = enrollments.map((e) =>
      e.traineeId === traineeId && e.courseId === courseId
        ? { ...e, progress: 100, completedAt: new Date().toISOString() }
        : e
    );
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
    const targetEnrollment = updated.find((e) => e.traineeId === traineeId && e.courseId === courseId);
    if (targetEnrollment?.id) {
      dbService.update("enrollments", targetEnrollment.id, { progress: 100, completedAt: targetEnrollment.completedAt }).catch(() => {});
    }

    const course = courses.find((c) => c.id === courseId);
    const certExists = certificates.find((c) => c.traineeId === traineeId && c.courseId === courseId);

    if (course && !certExists) {
      const users = getFromStorage<{ id: string; name: string }>(STORAGE_KEYS.USERS);
      const user = users.find((u) => u.id === traineeId);
      const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      const certHash = certData?.certificateHash || `CC-CERT-${randomSuffix}`;
      const defaultGrade = scorePercentage !== undefined
        ? (scorePercentage >= 90 ? `Distinction (${scorePercentage}%)` : `Passed (${scorePercentage}%)`)
        : (grade || "Passed (100%)");

      const origin = typeof window !== "undefined" ? window.location.origin : "https://capacityconnect.org";
      const cert: Certificate = {
        id: certData?.id || generateId("cert"),
        traineeId,
        traineeName: certData?.traineeName || user?.name || "Student",
        courseId,
        courseTitle: course.title,
        issuedAt: certData?.issuedAt || new Date().toISOString(),
        trainerName: certData?.trainerName || course.trainerName,
        certificateHash: certHash,
        grade: certData?.grade || grade || defaultGrade,
        verificationUrl: certData?.verificationUrl || `${origin}/verify/id?cert=${encodeURIComponent(certHash)}&name=${encodeURIComponent(user?.name || "Student")}&course=${encodeURIComponent(course.title)}`
      };
      const updatedCerts = [...certificates, cert];
      saveToStorage(STORAGE_KEYS.CERTIFICATES, updatedCerts);
      set({ enrollments: updated, certificates: updatedCerts });
      dbService.create("certificates", cert).catch(() => {});
      return cert;
    } else {
      set({ enrollments: updated });
      return certExists;
    }
  },

  addResource: (resource) => {
    const { courses } = get();
    const updated = courses.map((c) =>
      c.id === resource.courseId ? { ...c, resources: [...(c.resources || []), resource] } : c
    );
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
    const targetCourse = updated.find((c) => c.id === resource.courseId);
    if (targetCourse) {
      dbService.update("courses", resource.courseId, { resources: targetCourse.resources }).catch(() => {});
    }
  },

  deleteResource: (courseId, resourceId) => {
    const { courses } = get();
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, resources: (c.resources || []).filter((r) => r.id !== resourceId) } : c
    );
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
    const targetCourse = updated.find((c) => c.id === courseId);
    if (targetCourse) {
      dbService.update("courses", courseId, { resources: targetCourse.resources }).catch(() => {});
    }
  },

  addCourse: (course) => {
    const { courses } = get();
    // Prevent duplicate entries of the same course
    const exists = courses.some((c) => c.id === course.id || (c.title.trim().toLowerCase() === course.title.trim().toLowerCase() && c.trainerId === course.trainerId));
    if (exists) {
      console.warn("Course with identical ID or title/trainer already exists, skipping duplicate addition:", course.title);
      return;
    }
    const updated = [...courses, course];
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
    dbService.create("courses", course).catch(() => {});
  },

  updateCourse: (courseId, updates) => {
    const { courses } = get();
    const updated = courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c));
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
    dbService.update("courses", courseId, updates).catch(() => {});
  },

  deleteCourse: (courseId) => {
    const { courses, enrollments, feedbacks, certificates } = get();
    const courseToDelete = courses.find((c) => c.id === courseId);

    // 1. Mark in permanent DELETED_COURSES tombstone so seed logic and remote sync will NEVER resurrect it
    const deletedIds = getDeletedCourseIds();
    deletedIds.add(courseId);
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_COURSES, JSON.stringify(Array.from(deletedIds)));
    } catch (e) {}

    // 2. Remove course from state and localStorage
    const updatedCourses = courses.filter((c) => c.id !== courseId);
    saveToStorage(STORAGE_KEYS.COURSES, updatedCourses);

    // 3. Cascade remove enrollments
    const enrollmentsToRemove = enrollments.filter((e) => e.courseId === courseId);
    const updatedEnrollments = enrollments.filter((e) => e.courseId !== courseId);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updatedEnrollments);

    // 4. Cascade remove feedbacks
    const feedbacksToRemove = feedbacks.filter((f) => f.courseId === courseId);
    const updatedFeedbacks = feedbacks.filter((f) => f.courseId !== courseId);
    saveToStorage(STORAGE_KEYS.FEEDBACKS, updatedFeedbacks);

    // 5. Cascade remove certificates
    const certsToRemove = certificates.filter((c) => c.courseId === courseId);
    const updatedCertificates = certificates.filter((c) => c.courseId !== courseId);
    saveToStorage(STORAGE_KEYS.CERTIFICATES, updatedCertificates);

    set({
      courses: updatedCourses,
      enrollments: updatedEnrollments,
      feedbacks: updatedFeedbacks,
      certificates: updatedCertificates
    });

    // 6. Clean up stored video blobs from IndexedDB if any
    if (courseToDelete?.lessons) {
      for (const lesson of courseToDelete.lessons) {
        if (lesson.id) deleteVideoBlob(lesson.id).catch(() => {});
        if (lesson.videoId) deleteVideoBlob(lesson.videoId).catch(() => {});
      }
    }

    // 7. Cascade remove assessments and attempts for this course
    try {
      const allAssessments = getFromStorage<any>(STORAGE_KEYS.ASSESSMENTS);
      const assessmentsForCourse = allAssessments.filter((a: any) => a.courseId === courseId);
      const assessIdsToRemove = new Set(assessmentsForCourse.map((a: any) => a.id));
      const remainingAssessments = allAssessments.filter((a: any) => a.courseId !== courseId);
      saveToStorage(STORAGE_KEYS.ASSESSMENTS, remainingAssessments);

      const allAttempts = getFromStorage<any>(STORAGE_KEYS.ATTEMPTS);
      const remainingAttempts = allAttempts.filter((att: any) => !assessIdsToRemove.has(att.assessmentId));
      saveToStorage(STORAGE_KEYS.ATTEMPTS, remainingAttempts);

      assessmentsForCourse.forEach((a: any) => {
        dbService.remove("assessments", a.id).catch(() => {});
      });
    } catch (e) {}

    // 8. Cascade remove live sessions
    try {
      const allLiveSessions = getFromStorage<any>(STORAGE_KEYS.LIVE_SESSIONS);
      const liveSessionsForCourse = allLiveSessions.filter((ls: any) => ls.courseId === courseId);
      const remainingLiveSessions = allLiveSessions.filter((ls: any) => ls.courseId !== courseId);
      saveToStorage(STORAGE_KEYS.LIVE_SESSIONS, remainingLiveSessions);

      liveSessionsForCourse.forEach((ls: any) => {
        dbService.remove("live_sessions", ls.id).catch(() => {});
      });
    } catch (e) {}

    // 9. Cascade remove discussions
    try {
      const allDiscussions = getFromStorage<any>(STORAGE_KEYS.DISCUSSIONS);
      const remainingDiscussions = allDiscussions.filter((d: any) => d.courseId !== courseId);
      saveToStorage(STORAGE_KEYS.DISCUSSIONS, remainingDiscussions);
    } catch (e) {}

    // 10. Permanently remove from central DB & cloud Supabase
    dbService.remove("courses", courseId).catch(() => {});
    enrollmentsToRemove.forEach((e) => dbService.remove("enrollments", e.id).catch(() => {}));
    feedbacksToRemove.forEach((f) => dbService.remove("feedbacks", f.id).catch(() => {}));
    certsToRemove.forEach((c) => dbService.remove("certificates", c.id).catch(() => {}));
  },

  addFeedback: (fb) => {
    const { feedbacks, courses, enrollments } = get();

    // Guard: Trainee MUST be enrolled in the course to rate it
    const isEnrolled = enrollments.some(
      (e) => e.traineeId === fb.traineeId && e.courseId === fb.courseId
    );
    if (!isEnrolled) {
      console.warn("Feedback rejected: Trainee is not enrolled in course", fb.courseId);
      return;
    }

    // Upsert feedback: update existing rating if student previously reviewed this course
    const existingIndex = feedbacks.findIndex(
      (f) => f.courseId === fb.courseId && f.traineeId === fb.traineeId
    );
    let updatedFeedbacks: typeof feedbacks;
    if (existingIndex >= 0) {
      const existingId = feedbacks[existingIndex].id;
      const updatedItem = { ...fb, id: existingId };
      updatedFeedbacks = [...feedbacks];
      updatedFeedbacks[existingIndex] = updatedItem;
      dbService.update("feedbacks", existingId, updatedItem).catch(() => {});
    } else {
      updatedFeedbacks = [fb, ...feedbacks];
      dbService.create("feedbacks", fb).catch(() => {});
    }

    saveToStorage(STORAGE_KEYS.FEEDBACKS, updatedFeedbacks);

    // Automatically recalculate the overall quality rating for this course directly from authentic student ratings
    const courseFeedbacks = updatedFeedbacks.filter((f) => f.courseId === fb.courseId);
    const sumRatings = courseFeedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avgRating = Number((sumRatings / courseFeedbacks.length).toFixed(1));

    const updatedCourses = courses.map((c) => {
      if (c.id === fb.courseId) {
        return {
          ...c,
          rating: avgRating,
          totalRatings: courseFeedbacks.length
        };
      }
      return c;
    });

    saveToStorage(STORAGE_KEYS.COURSES, updatedCourses);
    set({ feedbacks: updatedFeedbacks, courses: updatedCourses });
    dbService.update("courses", fb.courseId, { rating: avgRating, totalRatings: courseFeedbacks.length }).catch(() => {});
  },

  deleteFeedback: (feedbackId) => {
    const { feedbacks, courses } = get();
    const targetFeedback = feedbacks.find((f) => f.id === feedbackId);
    const updatedFeedbacks = feedbacks.filter((f) => f.id !== feedbackId);
    saveToStorage(STORAGE_KEYS.FEEDBACKS, updatedFeedbacks);
    dbService.remove("feedbacks", feedbackId).catch(() => {});

    if (targetFeedback) {
      const remainingCourseFeedbacks = updatedFeedbacks.filter((f) => f.courseId === targetFeedback.courseId);
      const avgRating =
        remainingCourseFeedbacks.length > 0
          ? Number((remainingCourseFeedbacks.reduce((acc, f) => acc + f.rating, 0) / remainingCourseFeedbacks.length).toFixed(1))
          : 0;

      const updatedCourses = courses.map((c) => {
        if (c.id === targetFeedback.courseId) {
          return {
            ...c,
            rating: avgRating,
            totalRatings: remainingCourseFeedbacks.length
          };
        }
        return c;
      });
      saveToStorage(STORAGE_KEYS.COURSES, updatedCourses);
      set({ feedbacks: updatedFeedbacks, courses: updatedCourses });
      dbService.update("courses", targetFeedback.courseId, { rating: avgRating, totalRatings: remainingCourseFeedbacks.length }).catch(() => {});
    } else {
      set({ feedbacks: updatedFeedbacks });
    }
  },

  getCourseFeedbacks: (courseId) => {
    return get().feedbacks.filter((f) => f.courseId === courseId);
  },

  getTrainerFeedbacks: (trainerId) => {
    const { courses, feedbacks } = get();
    const trainerCourseIds = new Set(courses.filter((c) => c.trainerId === trainerId).map((c) => c.id));
    return feedbacks.filter((f) => f.trainerId === trainerId || trainerCourseIds.has(f.courseId));
  },

  isEnrolled: (traineeId, courseId) => {
    return get().enrollments.some((e) => e.traineeId === traineeId && e.courseId === courseId);
  },

  getEnrollment: (traineeId, courseId) => {
    return get().enrollments.find((e) => e.traineeId === traineeId && e.courseId === courseId);
  },

  getTraineeCertificates: (traineeId) => {
    return get().certificates.filter((c) => c.traineeId === traineeId);
  },

  getTrainerCourses: (trainerId) => {
    return get().courses.filter((c) => c.trainerId === trainerId);
  }
}));
