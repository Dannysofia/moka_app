import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.initUser();
  }

  private async initUser() {
    const { data } = await this.supabase.auth.getSession();
    if (data.session?.user) {
      this.currentUserSubject.next(data.session.user);
    }

    // Escuchar cambios de sesión
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      this.currentUserSubject.next(data.user);
    }
    return data;
  }

  async register(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

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

  async isLoggedIn(): Promise<boolean> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) return false;
    return !!data.session;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUserSubject.next(null);
  }

  // NUEVO: Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // NUEVO: Obtener el user_id actual (esto es lo que necesitan los servicios)
  getCurrentUserId(): string | null {
    return this.currentUserSubject.value?.id ?? null;
  }

  // NUEVO: Obtener el user de forma asíncrona
  async getCurrentUserAsync(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}