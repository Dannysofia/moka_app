import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import {
  Categoria,
  CrearProductoDto,
  Producto,
  Resultado,
  validarProducto,
} from '../model/inventario-model';

@Injectable({ providedIn: 'root' })
export class InventarioServices {
  private readonly tabla = 'productos';
  private readonly enabled = environment.supabase?.enabled !== false;
  private readonly sb: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.anonKey
  );

  // Fallback en memoria para cuando Supabase esté deshabilitado
  private memoria: Producto[] = [];

  constructor() {}

  async listar(): Promise<Resultado<Producto[]>> {
    try {
      if (this.enabled) {
        const { data, error } = await this.sb
          .from(this.tabla)
          .select('id, nombre, descripcion, categoria, cantidad, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped: Producto[] = (data ?? []).map((r: any) => ({
          id: String(r.id),
          nombre: r.nombre,
          descripcion: r.descripcion ?? undefined,
          categoria: r.categoria as Categoria,
          cantidad: Number(r.cantidad ?? 0),
          created_at: r.created_at ?? undefined,
        }));
        return { ok: true, data: mapped };
      }
      return {
        ok: true,
        data: [...this.memoria].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
      };
    } catch (e: any) {
      return { ok: false, error: 'No fue posible consultar los productos' };
    }
  }

  async crear(input: CrearProductoDto): Promise<Resultado<Producto>> {
    // Validaciones de negocio
    const errorValidacion = validarProducto(input);
    if (errorValidacion) {
      return { ok: false, error: errorValidacion };
    }

    try {
      if (this.enabled) {
        // Validación de unicidad por categoría (considerando RLS por usuario)
        const { data: existentes, error: errExist } = await this.sb
          .from(this.tabla)
          .select('id')
          .eq('categoria', input.categoria)
          .eq('nombre', input.nombre.trim())
          .limit(1);
        if (errExist) throw errExist;
        if (existentes && existentes.length > 0) {
          return { ok: false, error: 'Ya hay un producto con ese nombre en esta categoría' };
        }

        const payload = {
          nombre: input.nombre.trim(),
          descripcion: input.descripcion?.trim() || null,
          categoria: input.categoria,
          cantidad: input.cantidad,
          created_at: new Date().toISOString(),
        } as const;
        const { data, error } = await this.sb
          .from(this.tabla)
          .insert(payload)
          .select('id, nombre, descripcion, categoria, cantidad, created_at')
          .single();
        if (error) throw error;
        const mapped: Producto = {
          id: String((data as any).id),
          nombre: (data as any).nombre,
          descripcion: (data as any).descripcion ?? undefined,
          categoria: (data as any).categoria,
          cantidad: Number((data as any).cantidad ?? 0),
          created_at: (data as any).created_at ?? undefined,
        };
        return { ok: true, data: mapped };
      }

      // Fallback en memoria
      if (
        this.memoria.some((p) => p.categoria === input.categoria && p.nombre === input.nombre.trim())
      ) {
        return { ok: false, error: 'Ya hay un producto con ese nombre en esta categoría' };
      }
      const nuevo: Producto = {
        id: String(Date.now()),
        nombre: input.nombre.trim(),
        descripcion: input.descripcion?.trim(),
        categoria: input.categoria,
        cantidad: input.cantidad,
        created_at: new Date().toISOString(),
      };
      this.memoria.unshift(nuevo);
      return { ok: true, data: nuevo };
    } catch (e: any) {
      return { ok: false, error: 'No fue posible crear el producto' };
    }
  }
}
