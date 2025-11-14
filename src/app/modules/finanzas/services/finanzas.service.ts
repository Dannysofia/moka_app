import { Injectable } from '@angular/core';
import { ResumenFinanciero, DistribucionGastos, Transaccion, FinancieroDB, mapFinancieroDBToApp, mapTransaccionToDB } from '../model/finanzas.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializar Supabase
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Obtener todas las transacciones activas desde Supabase
   */
  async getTransacciones(): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('financiero')
        .select('*')
        .eq('estado', 'activo')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener transacciones: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map((item: FinancieroDB) => mapFinancieroDBToApp(item));
    } catch (error: any) {
      console.error('Error al cargar transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtener transacciones por tipo (ingreso o gasto)
   */
  async getTransaccionesPorTipo(tipo: 'ingreso' | 'gasto'): Promise<Transaccion[]> {
    try {
      const { data, error } = await this.supabase
        .from('financiero')
        .select('*')
        .eq('tipo', tipo)
        .eq('estado', 'activo')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener ${tipo}s: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map((item: FinancieroDB) => mapFinancieroDBToApp(item));
    } catch (error: any) {
      console.error(`Error al cargar ${tipo}s:`, error);
      throw error;
    }
  }

  /**
   * Obtener transacciones del mes actual
   */
  async getTransaccionesMesActual(): Promise<Transaccion[]> {
    try {
      const ahora = new Date();
      const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

      const { data, error } = await this.supabase
        .from('financiero')
        .select('*')
        .eq('estado', 'activo')
        .gte('fecha', primerDia.toISOString().split('T')[0])
        .lte('fecha', ultimoDia.toISOString().split('T')[0])
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al obtener transacciones del mes: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map((item: FinancieroDB) => mapFinancieroDBToApp(item));
    } catch (error: any) {
      console.error('Error al cargar transacciones del mes:', error);
      throw error;
    }
  }

  /**
   * Agregar una nueva transacción
   */
  async agregarTransaccion(transaccion: Transaccion): Promise<Transaccion> {
    try {
      const transaccionDB = mapTransaccionToDB(transaccion);

      const { data, error } = await this.supabase
        .from('financiero')
        .insert([transaccionDB])
        .select()
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al agregar transacción: ${error.message}`);
      }

      return mapFinancieroDBToApp(data);
    } catch (error: any) {
      console.error('Error al agregar transacción:', error);
      throw error;
    }
  }

  /**
   * Eliminar una transacción (soft delete)
   */
  async eliminarTransaccion(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('financiero')
        .update({ estado: 'eliminado' })
        .eq('id', id);

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al eliminar transacción: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    }
  }

  /**
   * Actualizar una transacción existente
   */
  async actualizarTransaccion(id: number, transaccion: Transaccion): Promise<Transaccion> {
    try {
      const transaccionDB = mapTransaccionToDB(transaccion);

      const { data, error } = await this.supabase
        .from('financiero')
        .update(transaccionDB)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al actualizar transacción: ${error.message}`);
      }

      return mapFinancieroDBToApp(data);
    } catch (error: any) {
      console.error('Error al actualizar transacción:', error);
      throw error;
    }
  }

  /**
   * Calcular resumen financiero desde las transacciones
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

      // Estos valores podrían venir de otra tabla o ser calculados
      const ahorro = 0;
      const inversiones = 0;
      const balanceTotal = ingresos - gastos + ahorro + inversiones;

      return {
        ingresos,
        gastos,
        ahorro,
        inversiones,
        balanceTotal
      };
    } catch (error: any) {
      console.error('Error al calcular resumen:', error);
      throw error;
    }
  }

  /**
   * Calcular distribución de gastos por categoría
   */
  async calcularDistribucionGastos(): Promise<DistribucionGastos[]> {
    try {
      const gastos = await this.getTransaccionesPorTipo('gasto');
      
      // Agrupar por categoría
      const gastoPorCategoria = gastos.reduce((acc, gasto) => {
        if (!acc[gasto.categoria]) {
          acc[gasto.categoria] = 0;
        }
        acc[gasto.categoria] += gasto.monto;
        return acc;
      }, {} as { [key: string]: number });

      // Calcular total
      const totalGastos = Object.values(gastoPorCategoria).reduce((sum, monto) => sum + monto, 0);

      // Crear array de distribución
      const distribucion: DistribucionGastos[] = Object.entries(gastoPorCategoria).map(([categoria, monto]) => ({
        categoria,
        monto,
        porcentaje: totalGastos > 0 ? Math.round((monto / totalGastos) * 100) : 0
      }));

      // Ordenar de mayor a menor
      return distribucion.sort((a, b) => b.monto - a.monto);
    } catch (error: any) {
      console.error('Error al calcular distribución:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async getEstadisticas(): Promise<{ total: number, ingresos: number, gastos: number }> {
    try {
      const { count: total } = await this.supabase
        .from('financiero')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      const { count: ingresos } = await this.supabase
        .from('financiero')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'ingreso')
        .eq('estado', 'activo');

      const { count: gastos } = await this.supabase
        .from('financiero')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'gasto')
        .eq('estado', 'activo');

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