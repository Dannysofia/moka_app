import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth-services';
import { Empleado, EmpleadoDB, FormularioEmpleado, mapEmpleadoDBToApp } from '../model/personal.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  private getUserId(): string {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');
    return userId;
  }

  async getEmpleados(): Promise<Empleado[]> {
    try {
      const { data, error } = await this.supabase
        .from('personal')
        .select('*')
        .order('nombres', { ascending: true });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener empleados: ${error.message}`);
      }

      if (!data) return [];
      
      return data.map((emp: EmpleadoDB) => mapEmpleadoDBToApp(emp));
    } catch (error: any) {
      console.error('Error al cargar empleados:', error);
      throw error;
    }
  }

  async getEmpleadosActivos(): Promise<Empleado[]> {
    try {
      const { data, error } = await this.supabase
        .from('personal')
        .select('*')
        .eq('estado', 'activo')
        .order('nombres', { ascending: true });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener empleados activos: ${error.message}`);
      }

      if (!data) return [];
      
      return data.map((emp: EmpleadoDB) => mapEmpleadoDBToApp(emp));
    } catch (error: any) {
      console.error('Error al cargar empleados activos:', error);
      throw error;
    }
  }

  async getEmpleadoPorId(id: string): Promise<Empleado | null> {
    try {
      const { data, error } = await this.supabase
        .from('personal')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener empleado: ${error.message}`);
      }

      if (!data) return null;
      
      return mapEmpleadoDBToApp(data);
    } catch (error: any) {
      console.error('Error al cargar empleado:', error);
      throw error;
    }
  }

  async crearEmpleado(formulario: FormularioEmpleado): Promise<Empleado> {
    try {
      const nuevoEmpleado: Partial<EmpleadoDB> = {
        user_id: this.getUserId(), // ← Ahora usa user_id
        nombres: formulario.nombres,
        apellidos: formulario.apellidos,
        documento: formulario.documento || null,
        telefono: formulario.telefono || null,
        rol: formulario.rol || null,
        fecha_ingreso: formulario.fecha_ingreso || null,
        salario: formulario.salario ? parseFloat(formulario.salario) : null,
        estado: formulario.estado,
        direccion: formulario.direccion || null
      };

      const { data, error } = await this.supabase
        .from('personal')
        .insert([nuevoEmpleado])
        .select()
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al crear empleado: ${error.message}`);
      }

      return mapEmpleadoDBToApp(data);
    } catch (error: any) {
      console.error('Error al crear empleado:', error);
      throw error;
    }
  }

  async actualizarEmpleado(id: string, formulario: FormularioEmpleado): Promise<Empleado> {
    try {
      const cambios: Partial<EmpleadoDB> = {
        nombres: formulario.nombres,
        apellidos: formulario.apellidos,
        documento: formulario.documento || null,
        telefono: formulario.telefono || null,
        rol: formulario.rol || null,
        fecha_ingreso: formulario.fecha_ingreso || null,
        salario: formulario.salario ? parseFloat(formulario.salario) : null,
        estado: formulario.estado,
        direccion: formulario.direccion || null
      };

      const { data, error } = await this.supabase
        .from('personal')
        .update(cambios)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al actualizar empleado: ${error.message}`);
      }

      return mapEmpleadoDBToApp(data);
    } catch (error: any) {
      console.error('Error al actualizar empleado:', error);
      throw error;
    }
  }

  async eliminarEmpleado(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('personal')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al eliminar empleado: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error al eliminar empleado:', error);
      throw error;
    }
  }

  async cambiarEstadoEmpleado(id: string, estado: string): Promise<Empleado> {
    try {
      const { data, error } = await this.supabase
        .from('personal')
        .update({ estado })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al cambiar estado: ${error.message}`);
      }

      return mapEmpleadoDBToApp(data);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  }

  filtrarEmpleados(empleados: Empleado[], termino: string): Empleado[] {
    const terminoLower = termino.toLowerCase().trim();
    
    if (!terminoLower) {
      return empleados;
    }
    
    return empleados.filter(e =>
      e.nombreCompleto.toLowerCase().includes(terminoLower) ||
      (e.rol && e.rol.toLowerCase().includes(terminoLower)) ||
      (e.documento && e.documento.includes(terminoLower))
    );
  }

  async buscarEmpleados(termino: string): Promise<Empleado[]> {
    try {
      const { data, error } = await this.supabase
        .from('personal')
        .select('*')
        .or(`nombres.ilike.%${termino}%,apellidos.ilike.%${termino}%,documento.ilike.%${termino}%`)
        .order('nombres', { ascending: true });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al buscar empleados: ${error.message}`);
      }

      if (!data) return [];
      
      return data.map((emp: EmpleadoDB) => mapEmpleadoDBToApp(emp));
    } catch (error: any) {
      console.error('Error al buscar empleados:', error);
      throw error;
    }
  }

  async contarPorEstado(estado: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('personal')
        .select('*', { count: 'exact', head: true })
        .eq('estado', estado);

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al contar empleados: ${error.message}`);
      }

      return count || 0;
    } catch (error: any) {
      console.error('Error al contar empleados:', error);
      return 0;
    }
  }

  async getEstadisticas(): Promise<{ total: number, activos: number, inactivos: number }> {
    try {
      const { count: total } = await this.supabase
        .from('personal')
        .select('*', { count: 'exact', head: true });

      const { count: activos } = await this.supabase
        .from('personal')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      return {
        total: total || 0,
        activos: activos || 0,
        inactivos: (total || 0) - (activos || 0)
      };
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}