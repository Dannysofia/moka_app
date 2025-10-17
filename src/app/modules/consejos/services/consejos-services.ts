import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Consejo } from '../model/consejos-model';

@Injectable({ providedIn: 'root' })
export class ConsejosService {
  private readonly useSupabase: boolean;

  constructor(private supa: SupabaseService) {
    this.useSupabase = this.supa.isEnabled();
  }

  async listarConsejos(limit = 50): Promise<Consejo[]> {
    if (!this.useSupabase) {
      return [];
    }

    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const { data, error } = await this.supa.client
        .from('consejos')
        .select('id,titulo,contenido,categoria,fuente_url,fecha_publicacion,visibilidad,created_at,imagen_url')
        .eq('visibilidad', 'activo')
        .or(`fecha_publicacion.is.null,fecha_publicacion.lte.${todayStr}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Consejo[];
    } catch (error) {
      console.warn('Unable to fetch consejos from Supabase', error);
      return [];
    }
  }

  async obtenerConsejo(id: string): Promise<Consejo | null> {
    if (!this.useSupabase) {
      return null;
    }
    try {
      const { data, error } = await this.supa.client
        .from('consejos')
        .select('id,titulo,contenido,categoria,fuente_url,fecha_publicacion,visibilidad,created_at,imagen_url')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Consejo) || null;
    } catch (error) {
      console.warn('Unable to fetch consejo by id from Supabase', error);
      return null;
    }
  }
}
