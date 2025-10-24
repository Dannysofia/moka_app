import { Injectable } from '@angular/core';
import { ResumenFinanciero, DistribucionGastos } from '../model/finanzas.model';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {

  constructor() { }

  // Simula llamada a BD
  getResumenFinanciero(): ResumenFinanciero {
    return {
      ingresos: 5250.00,
      gastos: 3420.50,
      ahorro: 12800.00,
      inversiones: 8500.00,
      balanceTotal: 23129.50
    };
  }

  getDistribucionGastos(): DistribucionGastos[] {
    return [
      { categoria: 'Comida', porcentaje: 35, monto: 1197.18 },
      { categoria: 'Transporte', porcentaje: 25, monto: 855.13 },
      { categoria: 'Servicios', porcentaje: 20, monto: 684.10 },
      { categoria: 'Entretenimiento', porcentaje: 12, monto: 410.46 },
      { categoria: 'Otros', porcentaje: 8, monto: 273.64 }
    ];
  }
}