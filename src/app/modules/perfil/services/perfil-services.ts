import { Injectable } from "@angular/core";
import { createClient, SupabaseClient, type User } from "@supabase/supabase-js";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class PerfilService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
    }

    // Usuario actual (email desde Auth) con verificación de sesión
    async getCurrentUser(): Promise<User | null> {
        // Primero intenta recuperar la sesión en memoria
        const { data: sData, error: sErr } = await this.supabase.auth.getSession();
        if (!sErr && sData?.session?.user) return sData.session.user;
        // Fallback a getUser()
        const { data, error } = await this.supabase.auth.getUser();
        if (error) return null;
        return data.user ?? null;
    }

    // Perfil en caficultores por user_id
    async getUserProfile(userId: string) {
        const { data, error } = await this.supabase
            .from('caficultores')
            .select('nombre, apellido, telefono')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) throw new Error(error.message);
        return data ?? null;
    }

    // Perfil + correo (correo no editable, viene de Auth)
    async getCurrentUserNormalized(): Promise<{ nombre: string; apellidos: string; telefono: string; correo: string } | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;
        const profile = await this.getUserProfile(user.id);
        return {
            nombre: profile?.nombre ?? '',
            apellidos: profile?.apellido ?? '',
            telefono: profile?.telefono ?? '',
            correo: user.email ?? '',
        };
    }

    // Actualizar perfil editable (nombre, apellido, telefono)
    async updateCurrentUserProfile(payload: { nombre: string; apellido: string; telefono: string; }) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('No hay usuario autenticado.');
        // Comprobar si ya existe fila para este usuario
        const existing = await this.getUserProfile(user.id);
        if (existing) {
            const { error } = await this.supabase
                .from('caficultores')
                .update({
                    nombre: payload.nombre,
                    apellido: payload.apellido,
                    telefono: payload.telefono,
                })
                .eq('user_id', user.id);
            if (error) throw new Error(error.message);
            return true;
        } else {
            const { error } = await this.supabase
                .from('caficultores')
                .insert({
                    user_id: user.id,
                    nombre: payload.nombre,
                    apellido: payload.apellido,
                    telefono: payload.telefono,
                });
            if (error) throw new Error(error.message);
            return true;
        }
    }
}
