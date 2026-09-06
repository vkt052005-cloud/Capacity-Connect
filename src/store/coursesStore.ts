import { create } from "zustand";
import type { Course, Enrollment, Certificate, Resource, Feedback } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "../data/seed";
import { dbService } from "../services/db";

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
  return (courses || [])
    .filter((c) => {
      if (!c) return false;
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
  return (enrollments || []).filter((e) => {
    if (!e || !e.courseId) return false;
    if (["c1", "c2", "c3", "c4", "c5"].includes(e.courseId)) return false;
    return true;
  });
};

const sanitizeFeedbacks = (feedbacks: Feedback[]): Feedback[] => {
  return (feedbacks || []).filter((f) => {
    if (!f || !f.id) return false;
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

const initialFeedbacks = sanitizeFeedbacks(getFromStorage<Feedback>(STORAGE_KEYS.FEEDBACKS));
const initialCoursesList = sanitizeCourses(getFromStorage<Course>(STORAGE_KEYS.COURSES), initialFeedbacks);

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: initialCoursesList,
  enrollments: sanitizeEnrollments(getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS)),
  certificates: getFromStorage<Certificate>(STORAGE_KEYS.CERTIFICATES),
  feedbacks: initialFeedbacks,
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

        const validFeedbacks = sanitizeFeedbacks(cloudFeedbacks && cloudFeedbacks.length > 0 ? cloudFeedbacks : getFromStorage<Feedback>(STORAGE_KEYS.FEEDBACKS));
        const validCourses = sanitizeCourses(cloudCourses && cloudCourses.length > 0 ? cloudCourses : getFromStorage<Course>(STORAGE_KEYS.COURSES), validFeedbacks);
        const validEnrollments = sanitizeEnrollments(cloudEnrollments && cloudEnrollments.length > 0 ? cloudEnrollments : getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS));
        const validCertificates = cloudCertificates && cloudCertificates.length > 0 ? cloudCertificates : getFromStorage<Certificate>(STORAGE_KEYS.CERTIFICATES);

        saveToStorage(STORAGE_KEYS.COURSES, validCourses);
        saveToStorage(STORAGE_KEYS.ENROLLMENTS, validEnrollments);
        saveToStorage(STORAGE_KEYS.FEEDBACKS, validFeedbacks);
        saveToStorage(STORAGE_KEYS.CERTIFICATES, validCertificates);

        set({
          courses: validCourses,
          enrollments: validEnrollments,
          feedbacks: validFeedbacks,
          certificates: validCertificates,
        });
      } catch (err) {
        // Fallback to local
      }
    };

    dbService.subscribe("courses", () => refreshAll());
    dbService.subscribe("enrollments", () => refreshAll());
    dbService.subscribe("feedbacks", () => refreshAll());
    dbService.subscribe("certificates", () => refreshAll());
  },

  load: () => {
    const freshFeedbacks = sanitizeFeedbacks(getFromStorage<Feedback>(STORAGE_KEYS.FEEDBACKS));
    const freshCourses = sanitizeCourses(getFromStorage<Course>(STORAGE_KEYS.COURSES), freshFeedbacks);
    set({
      courses: freshCourses,
      enrollments: sanitizeEnrollments(getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS)),
      certificates: getFromStorage<Certificate>(STORAGE_KEYS.CERTIFICATES),
      feedbacks: freshFeedbacks
    });

    // Ensure real-time multi-device subscription is active
    get().initSubscription();

    // Asynchronously fetch latest records from central server DB and cloud
    Promise.all([
      dbService.getAll<Course>("courses"),
      dbService.getAll<Enrollment>("enrollments"),
      dbService.getAll<Feedback>("feedbacks"),
      dbService.getAll<Certificate>("certificates")
    ]).then(([srvCourses, srvEnrollments, srvFeedbacks, srvCertificates]) => {
      const activeFeedbacks = srvFeedbacks && srvFeedbacks.length > 0 ? sanitizeFeedbacks(srvFeedbacks) : freshFeedbacks;
      const activeCourses = srvCourses && srvCourses.length > 0 ? sanitizeCourses(srvCourses, activeFeedbacks) : freshCourses;
      const activeEnrollments = srvEnrollments && srvEnrollments.length > 0 ? sanitizeEnrollments(srvEnrollments) : get().enrollments;
      const activeCertificates = srvCertificates && srvCertificates.length > 0 ? srvCertificates : get().certificates;

      saveToStorage(STORAGE_KEYS.COURSES, activeCourses);
      saveToStorage(STORAGE_KEYS.ENROLLMENTS, activeEnrollments);
      saveToStorage(STORAGE_KEYS.FEEDBACKS, activeFeedbacks);
      saveToStorage(STORAGE_KEYS.CERTIFICATES, activeCertificates);

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
      c.id === resource.courseId ? { ...c, resources: [...c.resources, resource] } : c
    );
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
    const targetCourse = updated.find((c) => c.id === resource.courseId);
    if (targetCourse) {
      dbService.update("courses", resource.courseId, { resources: targetCourse.resources }).catch(() => {});
    }
  },

  addCourse: (course) => {
    const { courses } = get();
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
    const { courses } = get();
    const updated = courses.filter((c) => c.id !== courseId);
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
    dbService.remove("courses", courseId).catch(() => {});
  },

  addFeedback: (fb) => {
    const { feedbacks, courses } = get();
    const updatedFeedbacks = [fb, ...feedbacks];
    saveToStorage(STORAGE_KEYS.FEEDBACKS, updatedFeedbacks);
    dbService.create("feedbacks", fb).catch(() => {});

    // Automatically recalculate the overall quality rating for this course directly from student ratings
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
