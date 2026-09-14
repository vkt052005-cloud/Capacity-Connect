import { supabase, isSupabaseConfigured } from './supabase';

type ChangeCallback = (event: { action: 'create' | 'update' | 'delete' | 'sync'; data?: any }) => void;

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
        // If SSE endpoint is not available, close stream to prevent console 404 noise
        this.eventSource?.close();
        this.eventSource = null;
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

  private notifySubscribers(collection: string, payload: any) {
    if (this.listeners.has(collection)) {
      this.listeners.get(collection)?.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {}
      });
    }
  }

  // GET ALL Records directly from Cloud (with optional limit for pagination)
  public async getAll<T = any>(collection: string, limit?: number): Promise<T[]> {
    // 1. Primary: Authoritative Cloud Supabase
    if (isSupabaseConfigured) {
      try {
        const orderQuery = collection === 'enrollments' ? '' : 'order=created_at.desc';
        const cloudData = await supabase.select<T>(collection, orderQuery, limit);
        if (cloudData !== null && Array.isArray(cloudData)) {
          return cloudData;
        }
      } catch (err) {
        console.warn('Supabase fetch error on ' + collection + ':', err);
      }
    }

    // 2. Fallback: Central Server Database
    try {
      const url = limit
        ? `${this.getBaseUrl()}/api/db/${collection}?limit=${limit}`
        : `${this.getBaseUrl()}/api/db/${collection}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data as T[];
        }
      }
    } catch (e) {}

    return [];
  }

  // CREATE Record directly in Cloud
  public async create<T = any>(collection: string, record: T): Promise<T> {
    let cloudRecord: any = record;

    if (collection === 'audit_logs') {
      cloudRecord = {
        ...record,
        user_id: (record as any).actor || (record as any).user_id || 'System',
        action: (record as any).action || 'ACTION',
        details: (record as any).details || `${(record as any).actor || 'User'} (${(record as any).role || 'user'}): ${(record as any).action} on ${(record as any).target || 'system'} [${(record as any).status || 'SUCCESS'}]`,
        severity: (record as any).severity || ((record as any).status === 'FAILED' ? 'critical' : (record as any).status === 'WARNING' ? 'warning' : 'info'),
        ip_address: (record as any).ipAddress || (record as any).ip_address || '127.0.0.1'
      };
    } else if (collection === 'certificates') {
      cloudRecord = {
        id: (record as any).id,
        certificate_number: (record as any).certificateHash || (record as any).certificate_number || (record as any).id,
        user_name: (record as any).traineeName || (record as any).user_name || 'Student',
        course_title: (record as any).courseTitle || (record as any).course_title || 'Course',
        grade: (record as any).grade || 'Passed',
        verification_hash: (record as any).certificateHash || (record as any).verification_hash || (record as any).id,
        verification_url: (record as any).verificationUrl || (record as any).verification_url || 'https://capacityconnect.org/verify',
        user_id: (record as any).traineeId || (record as any).user_id,
        course_id: (record as any).courseId || (record as any).course_id,
        issue_date: (record as any).issuedAt || (record as any).issue_date || new Date().toISOString()
      };
    } else if (collection === 'live_sessions') {
      cloudRecord = {
        ...record,
        trainer_name: (record as any).trainerName || (record as any).trainer_name || 'Trainer',
        course_title: (record as any).courseTitle || (record as any).course_title || 'Live Interactive Class'
      };
    } else if (collection === 'feedbacks') {
      cloudRecord = {
        ...record,
        trainee_name: (record as any).traineeName || (record as any).trainee_name || 'Student',
        course_title: (record as any).courseTitle || (record as any).course_title || 'Course',
        comment: (record as any).comment || 'Feedback submitted'
      };
    } else if (collection === 'assessment_results' || collection === 'assessment_attempts') {
      cloudRecord = {
        id: (record as any).id,
        user_id: (record as any).traineeId || (record as any).user_id,
        assessment_id: (record as any).assessmentId || (record as any).assessment_id,
        score: Math.round((record as any).score ?? (record as any).percentage ?? 0),
        submitted_at: (record as any).submittedAt || (record as any).submitted_at || new Date().toISOString()
      };
    }

    if (isSupabaseConfigured) {
      try {
        const res = await supabase.insert(collection, cloudRecord);
        this.notifySubscribers(collection, { action: 'create', data: res || cloudRecord });
        return (res as T) || record;
      } catch (err) {
        console.warn('Supabase insert failed on ' + collection + ':', err);
      }
    }

    // Try central server DB
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/db/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloudRecord)
      });
      if (res.ok) {
        const data = await res.json();
        this.notifySubscribers(collection, { action: 'create', data });
        return data;
      }
    } catch (e) {}

    this.notifySubscribers(collection, { action: 'create', data: cloudRecord });
    return record;
  }

  // UPDATE Record directly in Cloud
  public async update<T = any>(collection: string, id: string, updates: Partial<T>): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.update(collection, 'id', id, updates);
        this.notifySubscribers(collection, { action: 'update', data: { id, ...updates } });
      } catch (err) {
        console.warn('Supabase update failed on ' + collection + ':', err);
      }
    }

    try {
      await fetch(`${this.getBaseUrl()}/api/db/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      this.notifySubscribers(collection, { action: 'update', data: { id, ...updates } });
    } catch (e) {}
  }

  // DELETE Record directly from Cloud
  public async remove(collection: string, id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.delete(collection, 'id', id);
        this.notifySubscribers(collection, { action: 'delete', data: { id } });
      } catch (err) {
        console.warn('Supabase delete failed on ' + collection + ':', err);
      }
    }

    try {
      await fetch(`${this.getBaseUrl()}/api/db/${collection}/${id}`, {
        method: 'DELETE'
      });
      this.notifySubscribers(collection, { action: 'delete', data: { id } });
    } catch (e) {}
  }

  // DELETE Records matching a condition from Cloud
  public async removeWhere(collection: string, column: string, value: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.delete(collection, column, value);
        this.notifySubscribers(collection, { action: 'delete', data: { [column]: value } });
      } catch (err) {
        console.warn(`Supabase delete failed on ${collection} where ${column}=${value}:`, err);
      }
    }

    try {
      await fetch(`${this.getBaseUrl()}/api/db/${collection}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`, {
        method: 'DELETE'
      });
      this.notifySubscribers(collection, { action: 'delete', data: { [column]: value } });
    } catch (e) {}
  }
}

export const dbService = new DatabaseService();
export default dbService;
