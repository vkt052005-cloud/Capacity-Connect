import type { Course, Enrollment, LiveSession } from "../types";

/**
 * Checks whether a given trainee is enrolled in the teacher's course for a live session.
 * A student qualifies as enrolled if:
 * 1. They are directly enrolled in the session's specific course (session.courseId).
 * 2. OR they are enrolled in ANY course taught by that teacher (session.trainerId or session.trainerName).
 * 3. OR the course title matches one of their enrolled courses.
 */
export function isStudentEnrolledInTeacherCourse(
  traineeId: string | undefined,
  session: LiveSession | undefined,
  courses: Course[],
  enrollments: Enrollment[]
): boolean {
  if (!traineeId || !session) return false;

  // 1. Direct course enrollment
  const directEnrollment = enrollments.some(
    (e) => (e.traineeId === traineeId || (e as any).userId === traineeId) && e.courseId === session.courseId
  );
  if (directEnrollment) return true;

  // 2. Set of all course IDs the student is actively enrolled in
  const studentEnrolledCourseIds = new Set(
    enrollments
      .filter((e) => e.traineeId === traineeId || (e as any).userId === traineeId)
      .map((e) => e.courseId)
  );

  if (studentEnrolledCourseIds.size === 0) return false;

  // 3. Match across teacher's courses
  const teacherCourseMatch = courses.some((c) => {
    if (!studentEnrolledCourseIds.has(c.id)) return false;

    // Matching trainerId
    if (session.trainerId && c.trainerId && session.trainerId === c.trainerId) {
      return true;
    }

    // Matching trainerName
    if (session.trainerName && c.trainerName) {
      const cleanSessionTeacher = session.trainerName
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|mrs\.)\s*/, "")
        .trim();
      const cleanCourseTeacher = c.trainerName
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|mrs\.)\s*/, "")
        .trim();

      if (
        cleanSessionTeacher.includes(cleanCourseTeacher) ||
        cleanCourseTeacher.includes(cleanSessionTeacher)
      ) {
        return true;
      }
    }

    // Matching course title
    if (session.courseTitle && c.title) {
      const sTitle = session.courseTitle.toLowerCase().trim();
      const cTitle = c.title.toLowerCase().trim();
      if (sTitle.includes(cTitle) || cTitle.includes(sTitle)) {
        return true;
      }
    }

    return false;
  });

  return teacherCourseMatch;
}

/**
 * Filter live sessions so that a trainee only receives broadcasts for teachers whose courses they are enrolled in.
 */
export function getEnrolledLiveSessions(
  sessions: LiveSession[],
  traineeId: string | undefined,
  courses: Course[],
  enrollments: Enrollment[]
): LiveSession[] {
  if (!traineeId) return [];
  return sessions.filter((s) => isStudentEnrolledInTeacherCourse(traineeId, s, courses, enrollments));
}
