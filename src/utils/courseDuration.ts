import type { Course, CourseLesson } from "../types";

/**
 * Parses duration string (e.g. "4 Mins", "20 Mins", "12 Hours", "15:30", "1 Hr 20 Mins")
 * and returns duration in total minutes.
 */
export function parseDurationToMinutes(durationStr?: string): number {
  if (!durationStr) return 0;
  const str = durationStr.trim().toLowerCase();

  // If it's pure number
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // MM:SS or HH:MM:SS format
  const colonMatch = str.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (colonMatch) {
    if (colonMatch[3] !== undefined) {
      // HH:MM:SS
      const hours = parseInt(colonMatch[1], 10);
      const mins = parseInt(colonMatch[2], 10);
      return hours * 60 + mins;
    } else {
      // MM:SS
      const mins = parseInt(colonMatch[1], 10);
      const secs = parseInt(colonMatch[2], 10);
      return mins + (secs >= 30 ? 1 : 0);
    }
  }

  let totalMinutes = 0;
  // Match hours
  const hrMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  if (hrMatch) {
    totalMinutes += Math.round(parseFloat(hrMatch[1]) * 60);
  }

  // Match minutes
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/i);
  if (minMatch) {
    totalMinutes += Math.round(parseFloat(minMatch[1]));
  }

  // If nothing matched yet, look for single isolated number
  if (totalMinutes === 0) {
    const rawNumberMatch = str.match(/\d+/);
    if (rawNumberMatch) {
      totalMinutes = parseInt(rawNumberMatch[0], 10);
    }
  }

  return totalMinutes;
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
    let totalMinutes = 0;
    for (const lesson of lessons) {
      totalMinutes += parseDurationToMinutes(lesson.duration);
    }

    if (totalMinutes > 0) {
      if (totalMinutes < 60) {
        durationStr = `${totalMinutes} Mins`;
      } else {
        const hours = Math.floor(totalMinutes / 60);
        const remMins = totalMinutes % 60;
        durationStr = remMins > 0 ? `${hours} Hr${hours > 1 ? "s" : ""} ${remMins} Mins` : `${hours} Hr${hours > 1 ? "s" : ""}`;
      }
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

  if (hasModules) {
    const count = Array.isArray(course.modules) ? course.modules.length : course.modules;
    return `${durationStr} • ${count} Modules`;
  }

  return durationStr;
}

/**
 * Formats seconds to human duration string (e.g. "4 Mins", "4m 12s", or "1 Hr 15 Mins")
 */
export function formatSecondsToDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "20 Mins";

  const totalSecs = Math.round(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const remSecs = totalSecs % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours} Hr${hours > 1 ? "s" : ""} ${minutes} Mins` : `${hours} Hr${hours > 1 ? "s" : ""}`;
  }

  if (minutes === 0) {
    return `${remSecs} Secs`;
  }

  if (remSecs === 0) {
    return `${minutes} Mins`;
  }

  return `${minutes}m ${remSecs}s`;
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
