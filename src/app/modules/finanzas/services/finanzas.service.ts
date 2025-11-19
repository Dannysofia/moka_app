import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth-services';
import {
  ResumenFinanciero,
  DistribucionGastos,
  Transaccion,
  FinancieroDB,
  mapFinancieroDBToApp,
  mapTransaccionToDB
} from '../model/finanzas.model';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {
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

  /**
   * OBTENER TODAS LAS TRANSACCIONES ACTIVAS DEL USUARIO
   */
  async getTransacciones(): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('financiero')
        .select('*')
        .eq('estado', 'activo')
        .eq('user_id', this.getUserId())
        .order('fecha', { ascending: false });

      if (error) throw new Error(`Error al obtener transacciones: ${error.message}`);
      if (!data) return [];

      return data.map((item: FinancieroDB) => mapFinancieroDBToApp(item));
    } catch (error: any) {
      console.error('Error al cargar transacciones:', error);
      throw error;
    }
  }

  /**
   * OBTENER TRANSACCIONES POR TIPO
   */
  async getTransaccionesPorTipo(tipo: 'ingreso' | 'gasto'): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('financiero')
        .select('*')
        .eq('tipo', tipo)
        .eq('estado', 'activo')
        .eq('user_id', this.getUserId())
        .order('fecha', { ascending: false });

      if (error) throw new Error(`Error al obtener ${tipo}s: ${error.message}`);
      if (!data) return [];

      return data.map((item: FinancieroDB) => mapFinancieroDBToApp(item));
    } catch (error: any) {
      console.error(`Error al cargar ${tipo}s:`, error);
      throw error;
    }
  }

  /**
   * OBTENER TRANSACCIONES DEL MES ACTUAL
   */
  async getTransaccionesMesActual(): Promise<Transaccion[]> {
    try {
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      const { data, error } = await this.supabase
        .from('financiero')
        .select('*')
        .eq('estado', 'activo')
        .eq('user_id', this.getUserId())
        .gte('fecha', primerDia.toISOString().split('T')[0])
        .lte('fecha', ultimoDia.toISOString().split('T')[0])
        .order('fecha', { ascending: false });

      if (error) throw new Error(`Error al obtener transacciones del mes: ${error.message}`);
      if (!data) return [];

      return data.map((item: FinancieroDB) => mapFinancieroDBToApp(item));
    } catch (error: any) {
      console.error('Error al cargar transacciones del mes:', error);
      throw error;
    }
  }

  /**
   * AGREGAR TRANSACCIÓN (CON USER_ID)
   */
  async agregarTransaccion(transaccion: Transaccion): Promise<Transaccion> {
    try {
      const transaccionDB = mapTransaccionToDB(transaccion);
      const transaccionConUser = {
        ...transaccionDB,
        user_id: this.getUserId()
      };

      const { data, error } = await this.supabase
        .from('financiero')
        .insert([transaccionConUser])
        .select()
        .single();

      if (error) throw new Error(`Error al agregar transacción: ${error.message}`);

      return mapFinancieroDBToApp(data);
    } catch (error: any) {
      console.error('Error al agregar transacción:', error);
      throw error;
    }
  }

  /**
   * ELIMINAR (SOFT DELETE)
   */
  async eliminarTransaccion(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('financiero')
        .update({ estado: 'eliminado' })
        .eq('id', id)
        .eq('user_id', this.getUserId());

      if (error) throw new Error(`Error al eliminar transacción: ${error.message}`);
    } catch (error: any) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    }
  }

  /**
   * ACTUALIZAR TRANSACCIÓN
   */
  async actualizarTransaccion(id: number, transaccion: Transaccion): Promise<Transaccion> {
    try {
      const transaccionDB = mapTransaccionToDB(transaccion);

      const { data, error } = await this.supabase
        .from('financiero')
        .update(transaccionDB)
        .eq('id', id)
        .eq('user_id', this.getUserId())
        .select()
        .single();

      if (error) throw new Error(`Error al actualizar: ${error.message}`);

      return mapFinancieroDBToApp(data);
    } catch (error: any) {
      console.error('Error al actualizar transacción:', error);
      throw error;
    }
  }

  /**
   * RESUMEN FINANCIERO
   */
  async calcularResumenFinanciero(): Promise<ResumenFinanciero> {
    try {
      const transacciones = await this.getTransaccionesMesActual();

      const ingresos = transacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

      const gastos = transacciones
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0);

      return {
        ingresos,
        gastos,
        ahorro: 0,
        inversiones: 0,
        balanceTotal: ingresos - gastos
      };
    } catch (error: any) {
      console.error('Error en resumen financiero:', error);
      throw error;
    }
  }

  /**
   * DISTRIBUCIÓN DE GASTOS
   */
  async calcularDistribucionGastos(): Promise<DistribucionGastos[]> {
    try {
      const gastos = await this.getTransaccionesPorTipo('gasto');

      const agrupado = gastos.reduce((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + item.monto;
        return acc;
      }, {} as { [key: string]: number });

      const total = Object.values(agrupado).reduce((a, b) => a + b, 0);

      return Object.entries(agrupado)
        .map(([categoria, monto]) => ({
          categoria,
          monto,
          porcentaje: total ? Math.round((monto / total) * 100) : 0
        }))
        .sort((a, b) => b.monto - a.monto);
    } catch (error: any) {
      console.error('Error al calcular distribución:', error);
      throw error;
    }
  }

  /**
   * ESTADÍSTICAS
   */
  async getEstadisticas(): Promise<{ total: number; ingresos: number; gastos: number }> {
    try {
      const { count: total } = await this.supabase
        .from('financiero')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo')
        .eq('user_id', this.getUserId());

      const { count: ingresos } = await this.supabase
        .from('financiero')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'ingreso')
        .eq('estado', 'activo')
        .eq('user_id', this.getUserId());

      const { count: gastos } = await this.supabase
        .from('financiero')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'gasto')
        .eq('estado', 'activo')
        .eq('user_id', this.getUserId());

      return {
        total: total || 0,
        ingresos: ingresos || 0,
        gastos: gastos || 0
      };
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}
