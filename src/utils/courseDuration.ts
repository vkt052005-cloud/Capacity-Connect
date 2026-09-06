import type { Course, CourseLesson } from "../types";

/**
 * Parses any duration string (e.g. "24 Secs", "24s", "24 minutes", "10:32:15", "0:24", "1 Hr 20 Mins", "85+ Hours • 139 Lessons")
 * and returns duration in total SECONDS with high precision.
 */
export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 0;
  const str = durationStr.trim().toLowerCase();

  // MM:SS or HH:MM:SS format (e.g. "0:24", "31:00", "10:32:15")
  const colonMatch = str.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (colonMatch) {
    if (colonMatch[3] !== undefined) {
      // HH:MM:SS
      const hours = parseInt(colonMatch[1], 10);
      const mins = parseInt(colonMatch[2], 10);
      const secs = parseInt(colonMatch[3], 10);
      return hours * 3600 + mins * 60 + secs;
    } else {
      // MM:SS
      const mins = parseInt(colonMatch[1], 10);
      const secs = parseInt(colonMatch[2], 10);
      return mins * 60 + secs;
    }
  }

  let totalSeconds = 0;
  let matchedAny = false;

  // Match hours: e.g. "2 hours", "1.5 hrs", "2h", "85+ Hours"
  const hrMatch = str.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:hours?|hrs?|h)\b/i);
  if (hrMatch) {
    totalSeconds += Math.round(parseFloat(hrMatch[1]) * 3600);
    matchedAny = true;
  }

  // Match minutes: e.g. "20 mins", "15 minutes", "30m", "10 min"
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|m)\b/i);
  if (minMatch) {
    totalSeconds += Math.round(parseFloat(minMatch[1]) * 60);
    matchedAny = true;
  }

  // Match seconds: e.g. "24 secs", "24s", "24 seconds", "24 sec"
  const secMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|sec|s)\b/i);
  if (secMatch) {
    totalSeconds += Math.round(parseFloat(secMatch[1]));
    matchedAny = true;
  }

  if (matchedAny) {
    return totalSeconds;
  }

  // If nothing matched yet, look for single isolated number (default to minutes if no units found)
  const rawNumberMatch = str.match(/\d+/);
  if (rawNumberMatch) {
    const num = parseFloat(rawNumberMatch[0]);
    return num * 60;
  }

  return 0;
}

/**
 * Backward-compatible helper returning duration in minutes.
 */
export function parseDurationToMinutes(durationStr?: string): number {
  const secs = parseDurationToSeconds(durationStr);
  return Math.round(secs / 60);
}

/**
 * Formats total seconds into a clean human-readable duration:
 * - 24 seconds -> "24 Secs"
 * - 60 seconds -> "1 Min"
 * - 84 seconds -> "1 Min 24 Secs"
 * - 1440 seconds (24 mins) -> "24 Mins"
 * - 3600 seconds -> "1 Hr"
 * - 5040 seconds -> "1 Hr 24 Mins"
 * - 86400 seconds -> "24 Hrs"
 */
export function formatSecondsToHuman(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return "0 Mins";

  const totalSecs = Math.round(totalSeconds);
  const hours = Math.floor(totalSecs / 3600);
  const remAfterHours = totalSecs % 3600;
  const minutes = Math.floor(remAfterHours / 60);
  const seconds = remAfterHours % 60;

  if (hours > 0) {
    const hrStr = `${hours} Hr${hours > 1 ? "s" : ""}`;
    if (minutes > 0) {
      return `${hrStr} ${minutes} Min${minutes > 1 ? "s" : ""}`;
    }
    return hrStr;
  }

  if (minutes > 0) {
    const minStr = `${minutes} Min${minutes > 1 ? "s" : ""}`;
    if (seconds > 0) {
      return `${minStr} ${seconds} Secs`;
    }
    return minStr;
  }

  return `${seconds} Secs`;
}

/**
 * Calculates dynamic course duration based on actual lessons attached to the course.
 * If modules were explicitly added, it displays "• X Modules". Otherwise, modules are omitted.
 * Fixes fake static "12 Hours • 4 Modules".
 */
export function formatCourseDuration(course: Course): string {
  const lessons: CourseLesson[] = course.lessons || [];
  let durationStr = "";

  if (lessons.length > 0) {
    let totalSeconds = 0;
    for (const lesson of lessons) {
      totalSeconds += parseDurationToSeconds(lesson.duration);
    }

    if (totalSeconds > 0) {
      durationStr = formatSecondsToHuman(totalSeconds);
    } else {
      durationStr = `${lessons.length} Lesson${lessons.length > 1 ? "s" : ""}`;
    }
  } else {
    // If no lessons, use course.duration ONLY if it doesn't contain the fake hardcoded template
    const raw = course.duration || "";
    if (raw.includes("12 Hours • 4 Modules")) {
      durationStr = "0 Mins";
    } else if (raw.trim()) {
      // If raw contains fake module info without lessons, strip out fake modules if lessons don't exist
      durationStr = raw.replace(/\s*•\s*4\s*Modules/i, "").trim() || "0 Mins";
    } else {
      durationStr = "0 Mins";
    }
  }

  // Check if course has genuine modules defined
  const hasModules =
    Array.isArray(course.modules)
      ? course.modules.length > 0
      : typeof course.modules === "number" && course.modules > 0;

  if (hasModules && !durationStr.includes("Module")) {
    const count = Array.isArray(course.modules) ? course.modules.length : course.modules;
    return `${durationStr} • ${count} Modules`;
  }

  return durationStr;
}

/**
 * Formats seconds to human duration string (e.g. "24 Secs", "4 Mins", "1 Min 24 Secs", or "1 Hr 15 Mins")
 */
export function formatSecondsToDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "20 Mins";
  return formatSecondsToHuman(seconds);
}

/**
 * Extracts duration from a File or direct media URL using an offscreen HTMLVideoElement.
 */
export function extractMediaDuration(source: File | string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      const cleanup = (urlToRevoke?: string) => {
        video.onloadedmetadata = null;
        video.onerror = null;
        video.src = "";
        if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
          URL.revokeObjectURL(urlToRevoke);
        }
      };

      video.onloadedmetadata = () => {
        const durationSecs = video.duration;
        const formatted = formatSecondsToDuration(durationSecs);
        cleanup(video.src);
        resolve(formatted);
      };

      video.onerror = () => {
        cleanup(video.src);
        resolve("20 Mins"); // Default fallback
      };

      if (typeof source === "string") {
        video.src = source;
      } else {
        const objectUrl = URL.createObjectURL(source);
        video.src = objectUrl;
      }
    } catch {
      resolve("20 Mins");
    }
  });
}
