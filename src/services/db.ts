import type { User } from '../types';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../data/seed';
import { supabase, isSupabaseConfigured } from './supabase';

type ChangeCallback = (event: { action: 'create' | 'update' | 'delete' | 'sync'; data?: any }) => void;

const COLLECTION_STORAGE_MAP: Record<string, string> = {
  users: STORAGE_KEYS.USERS,
  courses: STORAGE_KEYS.COURSES,
  enrollments: STORAGE_KEYS.ENROLLMENTS,
  feedbacks: STORAGE_KEYS.FEEDBACKS,
  certificates: STORAGE_KEYS.CERTIFICATES,
  live_sessions: STORAGE_KEYS.LIVE_SESSIONS,
  audit_logs: STORAGE_KEYS.AUDIT_LOGS,
  assessments: STORAGE_KEYS.ASSESSMENTS,
  notifications: STORAGE_KEYS.NOTIFICATIONS,
  session_attendance: STORAGE_KEYS.SESSION_ATTENDANCE,
  lesson_attendance: STORAGE_KEYS.LESSON_ATTENDANCE,
  assessment_attempts: STORAGE_KEYS.ATTEMPTS,
  subject_competencies: STORAGE_KEYS.COMPETENCIES,
  discussion_threads: STORAGE_KEYS.DISCUSSIONS,
  leaderboard: STORAGE_KEYS.LEADERBOARD,
  badges: STORAGE_KEYS.BADGES,
};

class DatabaseService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<ChangeCallback>> = new Map();
  private pollTimers: Map<string, any> = new Map();

  constructor() {
    this.initRealtimeStream();
  }

  private getBaseUrl(): string {
    if (typeof window === 'undefined') return 'http://localhost:5173';
    return window.location.origin;
  }

  private getStorageKey(collection: string): string | undefined {
    return COLLECTION_STORAGE_MAP[collection];
  }

  private initRealtimeStream() {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource(`${this.getBaseUrl()}/api/db/events`);

      this.eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'connected') return;

          const collection = payload.collection;
          if (collection && this.listeners.has(collection)) {
            this.listeners.get(collection)?.forEach((cb) => cb(payload));
          }
        } catch (err) {
          // Ignore parse errors
        }
      };

      this.eventSource.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch (err) {
      console.warn('Real-time SSE stream initialized with fallback polling');
    }
  }

  // Subscribe to real-time changes
  public subscribe(collection: string, callback: ChangeCallback): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set());
    }
    this.listeners.get(collection)!.add(callback);

    // Background polling safety net (every 2.5 seconds)
    if (!this.pollTimers.has(collection)) {
      let lastHash = '';
      const timer = setInterval(async () => {
        try {
          const items = await this.getAll(collection);
          const newHash = JSON.stringify(items.map((i: any) => (i.id || '') + (i.status || '') + (i.role || '') + (i.rating || '')));
          if (lastHash && newHash !== lastHash) {
            this.listeners.get(collection)?.forEach((cb) => cb({ action: 'sync' }));
          }
          lastHash = newHash;
        } catch (e) {}
      }, 2500);
      this.pollTimers.set(collection, timer);
    }

    return () => {
      this.listeners.get(collection)?.delete(callback);
      if (this.listeners.get(collection)?.size === 0) {
        clearInterval(this.pollTimers.get(collection));
        this.pollTimers.delete(collection);
      }
    };
  }

  // GET ALL Records
  public async getAll<T = any>(collection: string): Promise<T[]> {
    const storageKey = this.getStorageKey(collection);

    // 1. Try Cloud Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const cloudData = await supabase.select<T>(collection);
        if (cloudData && cloudData.length > 0) {
          if (storageKey) {
            saveToStorage(storageKey, cloudData);
          }
          return cloudData;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local central DB:', err);
      }
    }

    // 2. Try Central Server Database
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/db/${collection}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          if (storageKey) {
            saveToStorage(storageKey, data);
          }
          return data as T[];
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // 3. LocalStorage fallback
    if (storageKey) {
      return getFromStorage<T>(storageKey);
    }
    return [];
  }

  // CREATE Record
  public async create<T = any>(collection: string, record: T): Promise<T> {
    const storageKey = this.getStorageKey(collection);

    // 1. Optimistically save to local storage (with deduplication by id and course title/trainer)
    if (storageKey) {
      const local = getFromStorage<any>(storageKey);
      const recordId = (record as any)?.id;
      const alreadyInStorage = recordId
        ? local.some((item: any) => {
            if (item?.id === recordId) return true;
            if (collection === 'courses' && item?.title && (record as any)?.title) {
              const itemTitle = String(item.title).trim().toLowerCase();
              const recordTitle = String((record as any).title).trim().toLowerCase();
              const itemTrainer = item.trainerId || item.trainerName || '';
              const recordTrainer = (record as any).trainerId || (record as any).trainerName || '';
              return itemTitle === recordTitle && itemTrainer === recordTrainer;
            }
            return false;
          })
        : false;
      if (!alreadyInStorage) {
        saveToStorage(storageKey, [record, ...local]);
      }
    }

    // 2. Try Cloud Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.insert(collection, record);
      } catch (err) {
        console.warn('Supabase insert skipped or failed:', err);
      }
    }

    // 3. Post to central server database
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/db/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Saved locally and queued for server sync.');
    }

    return record;
  }

  // UPDATE Record
  public async update<T = any>(collection: string, id: string, updates: Partial<T>): Promise<void> {
    const storageKey = this.getStorageKey(collection);

    // 1. Update in local storage
    if (storageKey) {
      const local = getFromStorage<any>(storageKey);
      const updated = local.map((i: any) => (i.id === id ? { ...i, ...updates } : i));
      saveToStorage(storageKey, updated);
    }

    // 2. Try Cloud Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.update(collection, 'id', id, updates);
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }

    // 3. Put to central server database
    try {
      await fetch(`${this.getBaseUrl()}/api/db/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('Could not sync update to central server DB.');
    }
  }

  // DELETE Record
  public async remove(collection: string, id: string): Promise<void> {
    const storageKey = this.getStorageKey(collection);

    // 1. Delete from local storage
    if (storageKey) {
      const local = getFromStorage<any>(storageKey);
      const filtered = local.filter((i: any) => i.id !== id);
      saveToStorage(storageKey, filtered);
    }

    // 2. Try Cloud Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.delete(collection, 'id', id);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    // 3. Delete from central server database
    try {
      await fetch(`${this.getBaseUrl()}/api/db/${collection}/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Could not sync delete to central server DB.');
    }
  }
}

export const dbService = new DatabaseService();
export default dbService;
