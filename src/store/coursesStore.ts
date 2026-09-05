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
  completeCourse: (traineeId: string, courseId: string) => void;
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

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: getFromStorage<Course>(STORAGE_KEYS.COURSES),
  enrollments: getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS),
  certificates: getFromStorage<Certificate>(STORAGE_KEYS.CERTIFICATES),
  feedbacks: getFromStorage<Feedback>(STORAGE_KEYS.FEEDBACKS),

  load: () => {
    set({
      courses: getFromStorage<Course>(STORAGE_KEYS.COURSES),
      enrollments: getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS),
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

  completeCourse: (traineeId, courseId) => {
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
      const cert: Certificate = {
        id: generateId("cert"),
        traineeId,
        traineeName: user?.name || "Student",
        courseId,
        courseTitle: course.title,
        issuedAt: new Date().toISOString(),
        trainerName: course.trainerName,
        certificateHash: "CC-CERT-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        grade: "Distinction (94%)",
        verificationUrl: "https://capacityconnect.org/verify/CC-CERT-" + Math.random().toString(36).substr(2, 8).toUpperCase()
      };
      const updatedCerts = [...certificates, cert];
      saveToStorage(STORAGE_KEYS.CERTIFICATES, updatedCerts);
      set({ enrollments: updated, certificates: updatedCerts });
    } else {
      set({ enrollments: updated });
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
