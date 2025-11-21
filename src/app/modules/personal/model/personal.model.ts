// Interfaz que coincide con la tabla de Supabase
export interface EmpleadoDB {
  id: string; // uuid
  user_id: string; // uuid - Campo para RLS (el correcto)
  nombres: string;
  apellidos: string;
  documento: string | null;
  telefono: string | null;
  rol: string | null;
  fecha_ingreso: string | null; // date
  salario: number | null; // numeric
  estado: string; // USER-DEFINED (estado_generico)
  direccion: string | null;
  created_at: string; // timestamptz
}

// Interfaz de la aplicación
export interface Empleado {
  id: string;
  user_id: string; // ← CAMBIADO de usuario_id a user_id
  nombres: string;
  apellidos: string;
  nombreCompleto: string; // Helper para mostrar nombre completo
  documento?: string;
  telefono?: string;
  rol?: string;
  fecha_ingreso?: Date;
  salario?: number;
  estado: string;
  direccion?: string;
  created_at?: Date;
}

export interface FormularioEmpleado {
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  rol: string;
  fecha_ingreso: string;
  salario: string;
  estado: string;
  direccion: string;
}

export enum RolEmpleado {
  JORNALERO = 'Jornalero',
  CAPATAZ = 'Capataz',
  ADMINISTRADOR = 'Administrador',
  TECNICO = 'Técnico',
  OTRO = 'Otro'
}

export enum EstadoEmpleado {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
  VACACIONES = 'Vacaciones',
  SUSPENDIDO = 'Suspendido'
}

/**
 * Mapear de BD a modelo de aplicación
 */
export function mapEmpleadoDBToApp(db: EmpleadoDB): Empleado {
  return {
    id: db.id,
    user_id: db.user_id, // ← CAMBIADO de usuario_id a user_id
    nombres: db.nombres,
    apellidos: db.apellidos,
    nombreCompleto: `${db.nombres} ${db.apellidos}`,
    documento: db.documento || undefined,
    telefono: db.telefono || undefined,
    rol: db.rol || undefined,
    fecha_ingreso: db.fecha_ingreso ? new Date(db.fecha_ingreso) : undefined,
    salario: db.salario || undefined,
    estado: db.estado,
    direccion: db.direccion || undefined,
    created_at: db.created_at ? new Date(db.created_at) : undefined
  };
}