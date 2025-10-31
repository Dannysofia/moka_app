// Modelo que coincide con la tabla de Supabase
export interface CooperativaDB {
  id: string; // uuid en Supabase
  nombre: string;
  resumen: string | null;
  ubicacion: string | null;
  logo_url: string | null;
  activo: boolean | null;
}

// Modelo de la aplicación (mantiene la estructura anterior para compatibilidad)
export interface Cooperativa {
  id: string; // Cambiado de number a string para usar UUID
  nombre: string;
  ubicacion: string;
  resumen?: string;
  logo_url?: string;
  activo?: boolean;
  telefono?: string;
  email?: string;
  sitioWeb?: string;
  servicios: string[];
}

export interface EstadoCarga {
  cargando: boolean;
  error: boolean;
  mensajeError: string;
}

/**
 * Función helper para convertir de DB a modelo de aplicación
 */
export function mapCooperativaDBToApp(dbCoop: CooperativaDB): Cooperativa {
  return {
    id: dbCoop.id,
    nombre: dbCoop.nombre,
    ubicacion: dbCoop.ubicacion || 'Ubicación no disponible',
    resumen: dbCoop.resumen || undefined,
    logo_url: dbCoop.logo_url || undefined,
    activo: dbCoop.activo ?? true,
    servicios: [] // Por ahora vacío, se puede agregar otra tabla relacionada después
  };
}