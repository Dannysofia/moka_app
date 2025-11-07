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

  async listarPaginado(
    page: number,
    pageSize: number,
    search?: string
  ): Promise<Resultado<{ items: Producto[]; total: number; hasMore: boolean }>> {
    try {
      if (this.enabled) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        let q = this.sb
          .from(this.tabla)
          .select('id, nombre, descripcion, categoria, cantidad, created_at', { count: 'exact' })
          .order('created_at', { ascending: false });

        const term = (search || '').trim();
        if (term) {
          // Buscar por nombre o descripción; si coincide con una categoría exacta, filtra por categoría
          const cat = ['Insumos', 'Herramientas', 'Empaques', 'Otro'].includes(term)
            ? term
            : null;
          if (cat) {
            q = q.eq('categoria', cat);
          } else {
            q = q.or(
              `nombre.ilike.%${term.replaceAll('%', '')}%,descripcion.ilike.%${term.replaceAll('%', '')}%`
            );
          }
        }

        const { data, error, count } = await q.range(from, to);
        if (error) throw error;

        const items: Producto[] = (data ?? []).map((r: any) => ({
          id: String(r.id),
          nombre: r.nombre,
          descripcion: r.descripcion ?? undefined,
          categoria: r.categoria as Categoria,
          cantidad: Number(r.cantidad ?? 0),
          created_at: r.created_at ?? undefined,
        }));

        const total = count ?? 0;
        const hasMore = to + 1 < total;
        return { ok: true, data: { items, total, hasMore } };
      }

      // Fallback local
      const term = (search || '').toLowerCase().trim();
      let lista = [...this.memoria];
      if (term) {
        lista = lista.filter(
          (p) =>
            p.nombre.toLowerCase().includes(term) ||
            (p.descripcion || '').toLowerCase().includes(term) ||
            p.categoria.toLowerCase() === term
        );
      }
      const total = lista.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const items = lista.slice(start, end);
      return { ok: true, data: { items, total, hasMore: end < total } };
    } catch (e: any) {
      return { ok: false, error: 'No fue posible consultar los productos' };
    }
  }

  async actualizar(id: string, input: CrearProductoDto): Promise<Resultado<Producto>> {
    const errorValidacion = validarProducto(input);
    if (errorValidacion) {
      return { ok: false, error: 'Este campo no puede quedar vacío' };
    }

    try {
      if (this.enabled) {
        // Evitar duplicados con otro id
        const { data: existentes, error: errExist } = await this.sb
          .from(this.tabla)
          .select('id')
          .eq('categoria', input.categoria)
          .eq('nombre', input.nombre.trim())
          .neq('id', id)
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
        } as const;
        const { data, error } = await this.sb
          .from(this.tabla)
          .update(payload)
          .eq('id', id)
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
      const idx = this.memoria.findIndex((p) => p.id === id);
      if (idx === -1) return { ok: false, error: 'Producto no encontrado' };
      if (
        this.memoria.some(
          (p, i) => i !== idx && p.categoria === input.categoria && p.nombre === input.nombre.trim(),
        )
      ) {
        return { ok: false, error: 'Ya hay un producto con ese nombre en esta categoría' };
      }
      const actualizado: Producto = {
        ...this.memoria[idx],
        nombre: input.nombre.trim(),
        descripcion: input.descripcion?.trim(),
        categoria: input.categoria,
        cantidad: input.cantidad,
      };
      this.memoria[idx] = actualizado;
      return { ok: true, data: actualizado };
    } catch (e: any) {
      return { ok: false, error: 'No fue posible actualizar el producto' };
    }
  }

  async eliminar(id: string): Promise<Resultado<null>> {
    try {
      if (this.enabled) {
        const { error } = await this.sb.from(this.tabla).delete().eq('id', id);
        if (error) throw error;
        return { ok: true, data: null };
      }
      this.memoria = this.memoria.filter((p) => p.id !== id);
      return { ok: true, data: null };
    } catch (e: any) {
      return { ok: false, error: 'No se pudo eliminar el producto, inténtelo nuevamente' };
    }
  }
}
