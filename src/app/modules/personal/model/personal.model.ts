export interface Empleado {
  id: number;
  nombre: string;
  rol: string;
  telefono?: string;
  email?: string;
  estado: string;
}

export interface FormularioEmpleado {
  nombre: string;
  rol: string;
  telefono: string;
  email: string;
  estado: string;
}

export enum RolEmpleado {
  JORNALERO = 'Jornalero',
  CAPATAZ = 'Capataz',
  ADMINISTRADOR = 'Administrador',
  OTRO = 'Otro'
}

export enum EstadoEmpleado {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo'
}