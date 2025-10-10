export interface Cultivo {
  id: string;
  nombre: string; // max 50
  tipo: string; // 
  fechaSiembra: string; 
  area: number; // > 0, up to 2 decimals
  notas?: string; // max 250
  createdAt: string; 
}

export type EstadoTarea = string; 

export interface Tarea {
  id: string;
  cultivoId: string;
  tipo: string; 
  fechaProgramada: string; 
  estado: EstadoTarea; // default 'Pendiente'
  notas?: string; // max 200
  createdAt: string;
}

export interface CatalogoItem {
  codigo: string;
  nombre: string;
  activo?: boolean;
  orden?: number;
}



