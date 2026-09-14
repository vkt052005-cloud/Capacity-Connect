/**
 * Purges legacy and local device cache data to ensure the platform operates
 * purely against the Supabase Cloud backend without stale local storage.
 */
export function purgeLocalDeviceData(): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  const keysToPurge = [
    "cc_competencies",
    "cc_discussions",
    "cc_leaderboard",
    "cc_badges",
    "cc_deleted_courses",
    "cc_removed_users",
    "cc_temp_cache"
  ];

  for (const key of keysToPurge) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // Ignore errors
    }
  }
}
