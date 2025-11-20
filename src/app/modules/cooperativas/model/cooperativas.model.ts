// Modelo que coincide con la tabla de Supabase
export interface CooperativaDB {
  id: string; // uuid en Supabase
  nombre: string;
  resumen: string | null;
  ubicacion: string | null;
  contacto: string | null;
  logo_url: string | null;
  activo: boolean | null;
}

// Modelo de la aplicacion (mantiene la estructura anterior para compatibilidad)
export interface Cooperativa {
  id: string; // Cambiado de number a string para usar UUID
  nombre: string;
  ubicacion: string;
  resumen?: string;
  contacto?: string;
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
 * Funcion helper para convertir de DB a modelo de aplicacion
 */
export function mapCooperativaDBToApp(dbCoop: CooperativaDB): Cooperativa {
  const rawContacto =
    (dbCoop as any).contacto ??
    (dbCoop as any).Contacto ?? // columna creada con mayuscula
    (dbCoop as any).contact ?? // fallback en ingles
    (dbCoop as any).contact_phone ??
    null;
  const contacto =
    typeof rawContacto === 'string'
      ? rawContacto.trim() || undefined
      : undefined;

  return {
    id: dbCoop.id,
    nombre: dbCoop.nombre,
    ubicacion: dbCoop.ubicacion || 'Ubicacion no disponible',
    resumen: dbCoop.resumen || undefined,
    contacto,
    logo_url: dbCoop.logo_url || undefined,
    activo: dbCoop.activo ?? true,
    servicios: [] // Por ahora vacio, se puede agregar otra tabla relacionada despues
  };
}
