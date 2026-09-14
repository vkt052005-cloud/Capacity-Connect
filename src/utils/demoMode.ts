import type { User, Course } from "../types";

/**
 * Checks if a user is a disposable dummy/demo account
 * (e.g. admin@capacityconnect.org, trainer@capacityconnect.org, trainee@capacityconnect.org)
 */
export function isDemoAccount(user?: User | null | { email?: string; id?: string }): boolean {
  if (!user) return false;
  const email = (user.email || "").toLowerCase().trim();
  const id = (user.id || "").toLowerCase().trim();
  return (
    email.endsWith("@capacityconnect.org") ||
    email.includes("demo") ||
    id.includes("demo") ||
    id === "u-admin-demo" ||
    id === "u-trainer-demo" ||
    id === "u-trainee-demo"
  );
}

/**
 * Known core production course identifiers that are strictly protected from deletion/tampering
 */
export const CORE_PRODUCTION_COURSE_IDS = [
  "c-dsa",
  "c-sql",
  "c-web-dev",
  "c-python",
  "c-cplusplus",
  "c6",
  "c7",
  "c8",
  "c-dsa-advanced",
  "c-react-native",
  "c-ai-ml"
];

/**
 * Determines if a course is a production course that cannot be deleted or disrupted by demo users
 */
export function isProtectedProductionCourse(course?: Course | { id: string; trainerId?: string } | null): boolean {
  if (!course) return false;
  if (CORE_PRODUCTION_COURSE_IDS.includes(course.id)) return true;
  if (course.trainerId && !course.trainerId.includes("demo")) {
    return true;
  }
  return false;
}
