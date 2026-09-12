// Supabase Cloud Connector
// Provides standard PostgREST API access and Realtime WebSocket integration
const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL || 'https://osahxrfvcuxymkktrbwl.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AxPR4q9YGfHf-tywUOMuHw_3vaG15rV';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function toSnakeCaseKey(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCaseKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

export function rowToSnakeCase(row: any): any {
  if (Array.isArray(row)) return row.map(rowToSnakeCase);
  if (row !== null && typeof row === "object" && !(row instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      result[toSnakeCaseKey(key)] = value;
    }
    return result;
  }
  return row;
}

export function rowToCamelCase(row: any): any {
  if (Array.isArray(row)) return row.map(rowToCamelCase);
  if (row !== null && typeof row === "object" && !(row instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      result[toCamelCaseKey(key)] = value;
    }
    return result;
  }
  return row;
}

export class SupabaseClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, "");
    this.key = key;
  }

  private headers() {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  async select<T = any>(table: string, query: string = "", limit?: number, offset?: number): Promise<T[]> {
    if (!isSupabaseConfigured) return [];
    try {
      let q = query;
      if (limit !== undefined) {
        q = q ? `${q}&limit=${limit}` : `limit=${limit}`;
      }
      if (offset !== undefined) {
        q = q ? `${q}&offset=${offset}` : `offset=${offset}`;
      }
      const res = await fetch(`${this.url}/rest/v1/${table}${q ? `?${q}` : ""}`, {
        headers: this.headers(),
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map(rowToCamelCase) : [rowToCamelCase(data)];
        if (table === "users") {
          return mapped.map((u: any) => {
            if (u && (u.removedAt || u.removalReason || u.status === "removed")) {
              return { ...u, status: "removed" };
            }
            return u;
          }) as T[];
        }
        return mapped;
      }
    } catch (e) {
      console.error(`Supabase select error on ${table}:`, e);
    }
    return [];
  }

  async insert<T = any>(table: string, row: T | T[]): Promise<T | null> {
    if (!isSupabaseConfigured) return null;
    try {
      let payload = rowToSnakeCase(row);
      // Supabase users table constraint check: status in ('active', 'inactive', 'pending', 'suspended')
      if (table === "users") {
        if (Array.isArray(payload)) {
          payload = payload.map((p) => (p.status === "removed" ? { ...p, status: "suspended" } : p));
        } else if (payload && payload.status === "removed") {
          payload.status = "suspended";
        }
      }
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          ...this.headers(),
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        let result: any = null;
        if (Array.isArray(data)) {
          result = data.length > 0 ? rowToCamelCase(data[0]) : null;
        } else {
          result = rowToCamelCase(data);
        }
        if (table === "users" && result && (result.removedAt || result.removalReason)) {
          result.status = "removed";
        }
        return result;
      } else {
        const errText = await res.text();
        console.warn(`Supabase insert on ${table}:`, errText);
      }
    } catch (e) {
      console.error(`Supabase insert error on ${table}:`, e);
    }
    return null;
  }

  async update<T = any>(table: string, matchKey: string, matchVal: string, updates: Partial<T>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      let payload = rowToSnakeCase(updates);
      // Supabase users table check constraint: status in ('active', 'inactive', 'pending', 'suspended')
      if (table === "users" && payload && payload.status === "removed") {
        payload.status = "suspended";
      }
      const snakeMatchKey = toSnakeCaseKey(matchKey);
      const res = await fetch(`${this.url}/rest/v1/${table}?${snakeMatchKey}=eq.${encodeURIComponent(matchVal)}`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Supabase update error on ${table}:`, errText);
        return false;
      }
      return true;
    } catch (e) {
      console.error(`Supabase update error on ${table}:`, e);
      return false;
    }
  }

  async delete(table: string, matchKey: string, matchVal: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const snakeMatchKey = toSnakeCaseKey(matchKey);
      const res = await fetch(`${this.url}/rest/v1/${table}?${snakeMatchKey}=eq.${encodeURIComponent(matchVal)}`, {
        method: "DELETE",
        headers: this.headers(),
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase delete error on ${table}:`, e);
      return false;
    }
  }

  async uploadFile(bucket: string, path: string, file: Blob | File): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const cleanPath = path.replace(/^\/+/, "");
      const res = await fetch(`${this.url}/storage/v1/object/${bucket}/${cleanPath}`, {
        method: "POST",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "Content-Type": file.type || "video/mp4",
          "x-upsert": "true",
        },
        body: file,
      });
      if (res.ok) {
        return `${this.url}/storage/v1/object/public/${bucket}/${cleanPath}`;
      } else {
        const err = await res.text();
        console.warn(`Supabase Storage upload error on ${bucket}/${cleanPath}:`, err);
      }
    } catch (e) {
      console.error("Supabase Storage upload error:", e);
    }
    return null;
  }

  async deleteFile(bucket: string, paths: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const res = await fetch(`${this.url}/storage/v1/object/${bucket}`, {
        method: "DELETE",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: paths }),
      });
      return res.ok;
    } catch (e) {
      console.error("Supabase Storage delete error:", e);
      return false;
    }
  }
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
