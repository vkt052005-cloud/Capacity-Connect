/**
 * IndexedDB helper to persistently store and retrieve mentor uploaded video files
 * across browser sessions, tabs, and student logins.
 */

const DB_NAME = "CapacityConnectMediaDB";
const STORE_NAME = "videos";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a video File or Blob in IndexedDB under the given lesson ID or key.
 */
export async function storeVideoBlob(key: string, blob: Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);

      req.onsuccess = () => resolve(key);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to store video in IndexedDB", err);
    return key;
  }
}

/**
 * Permanently removes a stored video Blob from IndexedDB.
 */
export async function deleteVideoBlob(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    // Ignore error
  }
}

/**
 * Retrieves a stored video Blob from IndexedDB and returns a playable Object URL.
 */
export async function getVideoBlobUrl(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        if (req.result && req.result instanceof Blob) {
          const url = URL.createObjectURL(req.result);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("Failed to load video from IndexedDB", err);
    return null;
  }
}

/**
 * Converts various video links (YouTube, Google Drive, Vimeo, direct MP4)
 * into universally embeddable or streamable URLs.
 */
export function parsePlayableVideoUrl(url?: string): {
  type: "youtube" | "drive" | "direct" | "indexeddb" | "none";
  embedUrl?: string;
  streamUrl?: string;
} {
  if (!url) return { type: "none" };
  const trimmed = url.trim();

  // 1. IndexedDB custom protocol
  if (trimmed.startsWith("indexeddb://")) {
    return { type: "indexeddb", streamUrl: trimmed.replace("indexeddb://", "") };
  }

  // 2. Google Drive Links: e.g. drive.google.com/file/d/FILE_ID/view or id=FILE_ID
  if (trimmed.includes("drive.google.com")) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return {
        type: "drive",
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`
      };
    }
  }

  // 3. YouTube (playlists, youtu.be, standard watch)
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    if (trimmed.includes("youtube.com/embed/")) {
      return { type: "youtube", embedUrl: trimmed };
    }

    if (trimmed.includes("list=")) {
      const listMatch = trimmed.match(/[?&]list=([^#&?]+)/);
      const listId = listMatch ? listMatch[1] : null;
      if (listId) {
        const videoMatch = trimmed.match(/(?:youtu\.be\/|watch\?v=|embed\/)([^#&?]{11})/);
        if (videoMatch && videoMatch[1]) {
          return {
            type: "youtube",
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoMatch[1]}?list=${listId}&rel=0&autoplay=1`
          };
        }
        return {
          type: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&rel=0&autoplay=1`
        };
      }
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2]?.length === 11) {
      let startParam = "";
      const startMatch = trimmed.match(/[?&](?:t|start)=(\d+)/);
      if (startMatch) startParam = `&start=${startMatch[1]}`;
      return {
        type: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0${startParam}`
      };
    }
  }

  // 4. Direct stream URL (MP4, WebM, blob, https)
  return { type: "direct", streamUrl: trimmed };
}
