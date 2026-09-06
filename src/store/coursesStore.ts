import { create } from "zustand";
import type { Course, Enrollment, Certificate, Resource, Feedback } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "../data/seed";

interface CoursesState {
  courses: Course[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  feedbacks: Feedback[];
  load: () => void;
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
  isEnrolled: (traineeId: string, courseId: string) => boolean;
  getEnrollment: (traineeId: string, courseId: string) => Enrollment | undefined;
  getTraineeCertificates: (traineeId: string) => Certificate[];
  getTrainerCourses: (trainerId: string) => Course[];
}

const sanitizeCourses = (courses: Course[]): Course[] => {
  return (courses || []).filter((c) => {
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
  });
};

const sanitizeEnrollments = (enrollments: Enrollment[]): Enrollment[] => {
  return (enrollments || []).filter((e) => {
    if (!e || !e.courseId) return false;
    if (["c1", "c2", "c3", "c4", "c5"].includes(e.courseId)) return false;
    return true;
  });
};

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: sanitizeCourses(getFromStorage<Course>(STORAGE_KEYS.COURSES)),
  enrollments: sanitizeEnrollments(getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS)),
  certificates: getFromStorage<Certificate>(STORAGE_KEYS.CERTIFICATES),
  feedbacks: getFromStorage<Feedback>(STORAGE_KEYS.FEEDBACKS),

  load: () => {
    set({
      courses: sanitizeCourses(getFromStorage<Course>(STORAGE_KEYS.COURSES)),
      enrollments: sanitizeEnrollments(getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS)),
      certificates: getFromStorage<Certificate>(STORAGE_KEYS.CERTIFICATES),
      feedbacks: getFromStorage<Feedback>(STORAGE_KEYS.FEEDBACKS)
    });
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
  },

  unenroll: (traineeId, courseId) => {
    const { enrollments } = get();
    const updated = enrollments.filter((e) => !(e.traineeId === traineeId && e.courseId === courseId));
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
    set({ enrollments: updated });
  },

  updateProgress: (enrollmentId, progress) => {
    const { enrollments } = get();
    const updated = enrollments.map((e) => (e.id === enrollmentId ? { ...e, progress } : e));
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
    set({ enrollments: updated });
  },

  completeCourse: (traineeId, courseId, grade, scorePercentage, certData) => {
    const { enrollments, certificates, courses } = get();
    const updated = enrollments.map((e) =>
      e.traineeId === traineeId && e.courseId === courseId
        ? { ...e, progress: 100, completedAt: new Date().toISOString() }
        : e
    );
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, updated);
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
  },

  addCourse: (course) => {
    const { courses } = get();
    const updated = [...courses, course];
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
  },

  updateCourse: (courseId, updates) => {
    const { courses } = get();
    const updated = courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c));
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
  },

  deleteCourse: (courseId) => {
    const { courses } = get();
    const updated = courses.filter((c) => c.id !== courseId);
    saveToStorage(STORAGE_KEYS.COURSES, updated);
    set({ courses: updated });
  },

  addFeedback: (fb) => {
    const { feedbacks } = get();
    const updated = [...feedbacks, fb];
    saveToStorage(STORAGE_KEYS.FEEDBACKS, updated);
    set({ feedbacks: updated });
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
