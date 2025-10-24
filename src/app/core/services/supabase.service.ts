import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly enabled = environment.supabase?.enabled !== false;
  private readonly _client: SupabaseClient | null = this.enabled
    ? createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

  get client(): SupabaseClient {
    if (!this._client) {
      throw new Error('Supabase client is disabled');
    }
    return this._client;
  }

  isEnabled(): boolean {
    return this._client !== null;
  }
}
