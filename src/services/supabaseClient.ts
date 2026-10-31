// TripGuard AI - Supabase Client & Connection Manager
import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseManager {
  private client: SupabaseClient | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.init();
  }

  public init() {
    const url = localStorage.getItem('tripguard_supabase_url') || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
    const anonKey = localStorage.getItem('tripguard_supabase_anon_key') || 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

    if (url && anonKey && url.startsWith('http')) {
      try {
        this.client = createClient(url, anonKey);
        this.isConfigured = true;
      } catch (err) {
        console.warn('[SupabaseManager] Could not initialize Supabase client:', err);
        this.client = null;
        this.isConfigured = false;
      }
    } else {
      this.client = null;
      this.isConfigured = false;
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public isConnected(): boolean {
    return this.isConfigured && this.client !== null;
  }

  public updateCredentials(url: string, anonKey: string) {
    if (url && anonKey) {
      localStorage.setItem('tripguard_supabase_url', url.trim());
      localStorage.setItem('tripguard_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('tripguard_supabase_url');
      localStorage.removeItem('tripguard_supabase_anon_key');
    }
    this.init();
  }
}

export const supabaseManager = new SupabaseManager();
export const supabase = supabaseManager.getClient();
