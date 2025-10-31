import { Injectable } from '@angular/core';
import { Cooperativa, CooperativaDB, mapCooperativaDBToApp } from '../model/cooperativas.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CooperativasService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializar Supabase directamente aquí
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Obtener todas las cooperativas desde Supabase
   */
  async getCooperativas(): Promise<Cooperativa[]> {
    try {
      const { data, error } = await this.supabase
        .from('cooperativas')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener cooperativas: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map((coop: CooperativaDB) => mapCooperativaDBToApp(coop));
    } catch (error: any) {
      console.error('Error al cargar cooperativas:', error);
      throw error;
    }
  }

  /**
   * Obtener cooperativas activas solamente
   */
  async getCooperativasActivas(): Promise<Cooperativa[]> {
    try {
      const { data, error } = await this.supabase
        .from('cooperativas')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener cooperativas: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map((coop: CooperativaDB) => mapCooperativaDBToApp(coop));
    } catch (error: any) {
      console.error('Error al cargar cooperativas activas:', error);
      throw error;
    }
  }

  /**
   * Filtrar cooperativas por término de búsqueda (local)
   */
  filtrarCooperativas(cooperativas: Cooperativa[], termino: string): Cooperativa[] {
    const terminoLower = termino.toLowerCase().trim();
    
    if (!terminoLower) {
      return cooperativas;
    }
    
    return cooperativas.filter(coop =>
      coop.nombre.toLowerCase().includes(terminoLower) ||
      (coop.ubicacion && coop.ubicacion.toLowerCase().includes(terminoLower)) ||
      (coop.resumen && coop.resumen.toLowerCase().includes(terminoLower))
    );
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(): Promise<{ total: number, activas: number, inactivas: number }> {
    try {
      const { count: total } = await this.supabase
        .from('cooperativas')
        .select('*', { count: 'exact', head: true });

      const { count: activas } = await this.supabase
        .from('cooperativas')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

      return {
        total: total || 0,
        activas: activas || 0,
        inactivas: (total || 0) - (activas || 0)
      };
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}