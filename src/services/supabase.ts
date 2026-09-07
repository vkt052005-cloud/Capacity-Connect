// Supabase Cloud Connector
// Provides standard PostgREST API access and Realtime WebSocket integration
const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL || 'https://osahxrfvcuxymkktrbwl.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AxPR4q9YGfHf-tywUOMuHw_3vaG15rV';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export class SupabaseClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
  }

  private headers() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async select<T = any>(table: string, query: string = ''): Promise<T[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}${query ? `?${query}` : ''}`, {
        headers: this.headers()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(`Supabase select error on ${table}:`, e);
    }
    return [];
  }

  async insert<T = any>(table: string, row: T): Promise<T | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(row)
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
      }
    } catch (e) {
      console.error(`Supabase insert error on ${table}:`, e);
    }
    return null;
  }

  async update<T = any>(table: string, matchKey: string, matchVal: string, updates: Partial<T>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}?${matchKey}=eq.${matchVal}`, {
        method: 'PATCH',
        headers: this.headers(),
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase update error on ${table}:`, e);
      return false;
    }
  }

  async delete(table: string, matchKey: string, matchVal: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}?${matchKey}=eq.${matchVal}`, {
        method: 'DELETE',
        headers: this.headers()
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase delete error on ${table}:`, e);
      return false;
    }
  }
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
