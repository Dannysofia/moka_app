import { Injectable } from '@angular/core';
import { ResumenFinanciero, DistribucionGastos, Gasto } from '../model/finanzas.model';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {

  // Datos base quemados (fijos)
  private readonly INGRESOS_BASE = 5250.00;
  private readonly GASTOS_BASE = 3420.50;
  private readonly AHORRO_BASE = 12800.00;
  private readonly INVERSIONES_BASE = 8500.00;

  // Distribución base de gastos quemados
  private readonly DISTRIBUCION_BASE: DistribucionGastos[] = [
    { categoria: 'Comida', porcentaje: 35, monto: 1197.18 },
    { categoria: 'Transporte', porcentaje: 25, monto: 855.13 },
    { categoria: 'Servicios', porcentaje: 20, monto: 684.10 },
    { categoria: 'Entretenimiento', porcentaje: 12, monto: 410.46 },
    { categoria: 'Otros', porcentaje: 8, monto: 273.64 }
  ];

  // Array de gastos adicionales (dinámicos)
  private gastosAdicionales: Gasto[] = [];

  constructor() { }

  // Obtener resumen financiero actualizado
  getResumenFinanciero(): ResumenFinanciero {
    const gastosExtras = this.calcularTotalGastosAdicionales();
    const gastosTotal = this.GASTOS_BASE + gastosExtras;
    const balance = this.INGRESOS_BASE - gastosTotal + this.AHORRO_BASE + this.INVERSIONES_BASE;

    return {
      ingresos: this.INGRESOS_BASE,
      gastos: gastosTotal,
      ahorro: this.AHORRO_BASE,
      inversiones: this.INVERSIONES_BASE,
      balanceTotal: balance
    };
  }

  // Calcular total de gastos adicionales
  private calcularTotalGastosAdicionales(): number {
    return this.gastosAdicionales.reduce((total, gasto) => total + gasto.monto, 0);
  }

  // Obtener distribución de gastos actualizada
  getDistribucionGastos(): DistribucionGastos[] {
    // Clonar distribución base
    const distribucionActualizada = [...this.DISTRIBUCION_BASE];

    // Agregar gastos adicionales por categoría
    this.gastosAdicionales.forEach(gasto => {
      const categoriaExistente = distribucionActualizada.find(
        d => d.categoria.toLowerCase() === gasto.categoria.toLowerCase()
      );

      if (categoriaExistente) {
        categoriaExistente.monto += gasto.monto;
      } else {
        distribucionActualizada.push({
          categoria: gasto.categoria,
          porcentaje: 0,
          monto: gasto.monto
        });
      }
    });

    // Recalcular porcentajes
    const totalGastos = distribucionActualizada.reduce((sum, d) => sum + d.monto, 0);
    
    distribucionActualizada.forEach(d => {
      d.porcentaje = Math.round((d.monto / totalGastos) * 100);
    });

    // Ordenar de mayor a menor
    return distribucionActualizada.sort((a, b) => b.monto - a.monto);
  }

  // Obtener lista de gastos adicionales
  getListaGastos(): Gasto[] {
    return [...this.gastosAdicionales].reverse(); // Más recientes primero
  }

  // Agregar un nuevo gasto
  agregarGasto(gasto: Gasto): void {
    const nuevoGasto: Gasto = {
      ...gasto,
      fecha: new Date()
    };
    this.gastosAdicionales.push(nuevoGasto);
  }

  // Limpiar gastos adicionales
  limpiarGastos(): void {
    this.gastosAdicionales = [];
  }

  // Eliminar gasto por índice
  eliminarGasto(index: number): void {
    this.gastosAdicionales.splice(index, 1);
  }
}