// Modelo que coincide con la tabla de Supabase
export interface FinancieroDB {
  id: number;
  tipo: 'ingreso' | 'gasto';
  fecha: string; // DATE en formato ISO
  monto: number;
  categoria: string;
  notas: string | null;
  fecha_registro: string;
  fecha_actualizacion: string;
  estado: 'activo' | 'eliminado';
}

// Modelo de la aplicación
export interface Transaccion {
  id?: number;
  tipo: 'ingreso' | 'gasto';
  fecha: Date | string; // Puede ser Date o string ISO
  monto: number;
  categoria: string;
  notas?: string;
  estado?: 'activo' | 'eliminado';
}

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

export interface EstadoCarga {
  cargando: boolean;
  error: boolean;
  mensajeError: string;
}

/**
 * Función helper para convertir de DB a modelo de aplicación
 */
export function mapFinancieroDBToApp(dbItem: FinancieroDB): Transaccion {
  return {
    id: dbItem.id,
    tipo: dbItem.tipo,
    fecha: new Date(dbItem.fecha),
    monto: dbItem.monto,
    categoria: dbItem.categoria,
    notas: dbItem.notas || undefined,
    estado: dbItem.estado
  };
}

/**
 * Función helper para convertir de app a DB (para insertar/actualizar)
 */
export function mapTransaccionToDB(transaccion: Transaccion): Partial<FinancieroDB> {
  // Manejar tanto Date como string
  let fechaStr: string;
  if (transaccion.fecha instanceof Date) {
    fechaStr = transaccion.fecha.toISOString().split('T')[0];
  } else if (typeof transaccion.fecha === 'string') {
    fechaStr = transaccion.fecha.split('T')[0];
  } else {
    fechaStr = new Date().toISOString().split('T')[0];
  }

  return {
    tipo: transaccion.tipo,
    fecha: fechaStr, // Solo la fecha YYYY-MM-DD
    monto: transaccion.monto,
    categoria: transaccion.categoria,
    notas: transaccion.notas || null,
    estado: transaccion.estado || 'activo'
  };
}