export interface ResumenFinanciero {
  ingresos: number;
  gastos: number;
  ahorro: number;
  inversiones: number;
  balanceTotal: number;
}

export interface DistribucionGastos {
  categoria: string;
  porcentaje: number;
  monto: number;
}

export interface Gasto {
  categoria: string;
  descripcion: string;
  monto: number;
  fecha?: Date;
}