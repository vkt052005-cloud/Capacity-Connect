/**
 * Purges legacy and local device cache data to ensure the platform operates
 * purely against the Supabase Cloud backend without stale local storage.
 */
export function purgeLocalDeviceData(): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  const keysToPurge = [
    "cc_users",
    "cc_courses",
    "cc_enrollments",
    "cc_certificates",
    "cc_assessments",
    "cc_attempts",
    "cc_feedbacks",
    "cc_notifications",
    "cc_live_sessions",
    "cc_competencies",
    "cc_discussions",
    "cc_leaderboard",
    "cc_badges",
    "cc_audit_logs",
    "cc_session_attendance",
    "cc_lesson_attendance",
    "cc_deleted_courses",
    "cc_removed_users"
  ];

  for (const key of keysToPurge) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // Ignore errors
    }
  }
}
