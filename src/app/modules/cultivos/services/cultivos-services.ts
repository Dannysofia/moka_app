import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { Cultivo, Tarea, CatalogoItem } from '../model/cultivos-model';

@Injectable({ providedIn: 'root' })
export class CultivosService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  // ---------- Helpers de mapeo ----------
  private mapCultivoFromDb(row: any): Cultivo {
    return {
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo,
      fechaSiembra: row.fecha_siembra,
      area: Number(row.area),
      notas: row.notas ?? undefined,
      createdAt: row.created_at,
    };
  }

  private mapCultivoToDb(payload: Partial<Cultivo>) {
    return {
      nombre: payload.nombre,
      tipo: payload.tipo,
      fecha_siembra: payload.fechaSiembra,
      area: payload.area,
      notas: payload.notas ?? null,
    };
  }

  private mapTareaFromDb(row: any): Tarea {
    return {
      id: row.id,
      cultivoId: row.cultivo_id,
      tipo: row.tipo,
      fechaProgramada: row.fecha_programada,
      estado: row.estado,
      notas: row.notas ?? undefined,
      createdAt: row.created_at,
    };
  }

  private mapTareaToDb(payload: Partial<Tarea>) {
    return {
      cultivo_id: payload.cultivoId,
      tipo: payload.tipo,
      fecha_programada: payload.fechaProgramada,
      estado: payload.estado,
      notas: payload.notas ?? null,
    };
  }

  private toUserMessage(error: any): string {
    const msg: string = error?.message || '';
    if (/duplicate key value/i.test(msg) || /unique constraint/i.test(msg)) {
      return 'Ya existe un cultivo con ese nombre, intente con otro';
    }
    if (/fecha_siembra/i.test(msg) && /check constraint/i.test(msg)) {
      return 'La fecha de siembra no puede ser futura';
    }
    if (/area/i.test(msg) && /check constraint/i.test(msg)) {
      return 'El área debe ser mayor a 0';
    }
    if (/prevent_tarea_estado_downgrade/i.test(msg)) {
      return 'Una tarea completada no puede volver a un estado anterior';
    }
    if (/delete/i.test(msg) && /tareas/i.test(msg) && /estado/i.test(msg)) {
      return 'No es posible eliminar una tarea que ya fue completada';
    }
    return error?.message || 'Ocurrió un error, inténtelo nuevamente';
  }

  // ---------- Cultivos ----------
  async listarCultivos(): Promise<Cultivo[]> {
    const { data, error } = await this.supabase
      .from('cultivos')
      .select('id, nombre, tipo, fecha_siembra, area, notas, created_at')
      .order('nombre');
    if (error) throw new Error(this.toUserMessage(error));
    return (data || []).map((r: any) => this.mapCultivoFromDb(r));
  }

  async crearCultivo(payload: Omit<Cultivo, 'id' | 'createdAt'>): Promise<Cultivo> {
    const insert = this.mapCultivoToDb(payload);
    const { data, error } = await this.supabase
      .from('cultivos')
      .insert(insert)
      .select('id, nombre, tipo, fecha_siembra, area, notas, created_at')
      .single();
    if (error) throw new Error(this.toUserMessage(error));
    return this.mapCultivoFromDb(data);
  }

  async obtenerCultivo(id: string): Promise<Cultivo | undefined> {
    const { data, error } = await this.supabase
      .from('cultivos')
      .select('id, nombre, tipo, fecha_siembra, area, notas, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(this.toUserMessage(error));
    return data ? this.mapCultivoFromDb(data) : undefined;
  }

  async actualizarCultivo(id: string, cambios: Partial<Cultivo>): Promise<Cultivo> {
    const update = this.mapCultivoToDb(cambios);
    const { data, error } = await this.supabase
      .from('cultivos')
      .update(update)
      .eq('id', id)
      .select('id, nombre, tipo, fecha_siembra, area, notas, created_at')
      .single();
    if (error) throw new Error(this.toUserMessage(error));
    return this.mapCultivoFromDb(data);
  }

  async eliminarCultivo(id: string): Promise<void> {
    const { error } = await this.supabase.from('cultivos').delete().eq('id', id);
    if (error) throw new Error(this.toUserMessage(error));
  }

  // ---------- Tareas ----------
  async listarTareas(cultivoId: string): Promise<Tarea[]> {
    const { data, error } = await this.supabase
      .from('tareas')
      .select('id, cultivo_id, tipo, fecha_programada, estado, notas, created_at')
      .eq('cultivo_id', cultivoId)
      .order('fecha_programada');
    if (error) throw new Error(this.toUserMessage(error));
    return (data || []).map((r: any) => this.mapTareaFromDb(r));
  }

  async crearTarea(payload: Omit<Tarea, 'id' | 'createdAt' | 'estado'>): Promise<Tarea> {
    const insert = this.mapTareaToDb(payload);
    // Estado por defecto lo maneja la DB (Pendiente)
    delete (insert as any).estado;
    const { data, error } = await this.supabase
      .from('tareas')
      .insert(insert)
      .select('id, cultivo_id, tipo, fecha_programada, estado, notas, created_at')
      .single();
    if (error) throw new Error(this.toUserMessage(error));
    return this.mapTareaFromDb(data);
  }

  async obtenerTarea(cultivoId: string, tareaId: string): Promise<Tarea | undefined> {
    const { data, error } = await this.supabase
      .from('tareas')
      .select('id, cultivo_id, tipo, fecha_programada, estado, notas, created_at')
      .eq('cultivo_id', cultivoId)
      .eq('id', tareaId)
      .maybeSingle();
    if (error) throw new Error(this.toUserMessage(error));
    return data ? this.mapTareaFromDb(data) : undefined;
  }

  async actualizarTarea(cultivoId: string, tareaId: string, cambios: Partial<Tarea>): Promise<Tarea> {
    const update = this.mapTareaToDb({ ...cambios, cultivoId });
    const { data, error } = await this.supabase
      .from('tareas')
      .update(update)
      .eq('cultivo_id', cultivoId)
      .eq('id', tareaId)
      .select('id, cultivo_id, tipo, fecha_programada, estado, notas, created_at')
      .single();
    if (error) throw new Error(this.toUserMessage(error));
    return this.mapTareaFromDb(data);
  }

  async eliminarTarea(cultivoId: string, tareaId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tareas')
      .delete()
      .eq('cultivo_id', cultivoId)
      .eq('id', tareaId);
    if (error) throw new Error(this.toUserMessage(error));
  }

  // ---------- Catálogos (opciones desde BD) ----------
  async listarTiposCultivo(): Promise<CatalogoItem[]> {
    const { data, error } = await this.supabase
      .from('tipos_cultivo')
      .select('codigo, nombre, activo')
      .eq('activo', true)
      .order('nombre');
    if (error) throw new Error(this.toUserMessage(error));
    return (data || []) as CatalogoItem[];
  }

  async listarTiposTarea(): Promise<CatalogoItem[]> {
    const { data, error } = await this.supabase
      .from('tipos_tarea')
      .select('codigo, nombre, activo')
      .eq('activo', true)
      .order('nombre');
    if (error) throw new Error(this.toUserMessage(error));
    return (data || []) as CatalogoItem[];
  }

  async listarEstadosTarea(): Promise<CatalogoItem[]> {
    const { data, error } = await this.supabase
      .from('estados_tarea')
      .select('codigo, nombre, activo, orden')
      .eq('activo', true)
      .order('orden');
    if (error) throw new Error(this.toUserMessage(error));
    return (data || []) as CatalogoItem[];
  }
}
