export interface Cooperativa {
  id: number;
  nombre: string;
  ubicacion: string;
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