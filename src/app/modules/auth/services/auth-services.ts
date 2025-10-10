import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  // Registro de usuario en Supabase Auth
  async register(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  // Guardar datos extra en la tabla caficultores
  async saveCaficultor(caficultor: {
    nombre: string;
    apellido: string;
    telefono: string;
    user_id: string;
  }) {
    const { error } = await this.supabase.from('caficultores').insert([caficultor]);
    if (error) throw error;
    return true;
  }

  // Verifica si hay sesión activa en Supabase
  async isLoggedIn(): Promise<boolean> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) return false;
    return !!data.session;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
