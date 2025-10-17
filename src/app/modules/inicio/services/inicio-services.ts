import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Bienvenida, CalendarioAg, Cooperativa, Indicador, TipoIndicador } from '../model/inicio-model';

@Injectable({ providedIn: 'root' })
export class InicioService {
  private readonly useSupabase: boolean;

  constructor(private supa: SupabaseService) {
    this.useSupabase = this.supa.isEnabled();
  }

  async getBienvenida(usuarioId?: string): Promise<Bienvenida | null> {
    if (!this.useSupabase) {
      return null;
    }

    try {
      if (usuarioId) {
        const { data, error } = await this.supa.client
          .from('mensajes_bienvenida')
          .select('usuario_id,texto')
          .eq('usuario_id', usuarioId)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        return data as Bienvenida | null;
      }

      const { data, error } = await this.supa.client
        .from('mensajes_bienvenida')
        .select('texto')
        .eq('activo', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Bienvenida | null;
    } catch (error) {
      console.warn('Unable to fetch bienvenida from Supabase', error);
      return null;
    }
  }

  async getCalendario(): Promise<CalendarioAg | null> {
    if (!this.useSupabase) {
      return null;
    }

    try {
      const { data, error } = await this.supa.client
        .from('calendario')
        .select('calendario_url, created_at')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      const url = (data as any)?.calendario_url as string | undefined;
      if (!url) return null;
      return { url };
    } catch (error) {
      console.warn('Unable to fetch calendario from Supabase', error);
      return null;
    }
  }

  async getIndicadores(): Promise<Indicador[]> {
    if (!this.useSupabase) {
      return [];
    }

    try {
      const { data, error } = await this.supa.client
        .from('indicadores_mercado')
        .select('id,tipo,valor,fecha')
        .in('tipo', ['cafe_interno', 'bolsa_ny', 'tasa_cambio'] as TipoIndicador[])
        .order('fecha', { ascending: false });

      if (error) throw error;
      const byTipo = new Map<TipoIndicador, Indicador>();
      (data || []).forEach((row: any) => {
        const t = row.tipo as TipoIndicador;
        if (!byTipo.has(t)) byTipo.set(t, row as Indicador);
      });
      return Array.from(byTipo.values());
    } catch (error) {
      console.warn('Unable to fetch indicadores from Supabase', error);
      return [];
    }
  }

  async getCooperativasPreview(limit = 4): Promise<Cooperativa[]> {
    if (!this.useSupabase) {
      return [];
    }

    try {
      const { data, error } = await this.supa.client
        .from('cooperativas')
        .select('id,nombre,resumen,ubicacion,logo_url')
        .eq('activo', true)
        .order('nombre')
        .limit(limit);

      if (error) throw error;
      return (data || []) as Cooperativa[];
    } catch (error) {
      console.warn('Unable to fetch cooperativas from Supabase', error);
      return [];
    }
  }
}
