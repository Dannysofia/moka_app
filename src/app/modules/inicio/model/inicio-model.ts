// Modelos/DTOs del módulo Inicio

export interface Bienvenida {
  usuario_id: string | null;      // opcional: si manejas saludo por usuario
  texto: string;                  // máx 160 chars
}

export type TipoIndicador = 'cafe_interno' | 'bolsa_ny' | 'tasa_cambio';

export interface Indicador {
  id: string;
  tipo: TipoIndicador;
  valor: number | string;                  // 2–4 decimales
  fecha: string;                  // ISO date de actualización
}

export interface CalendarioAg {
  url: string;                    // ruta o URL del calendario agrícola
}

export interface Cooperativa {
  id: string;
  nombre: string;
  resumen: string;
  ubicacion?: string | null;
  logo_url?: string | null;
}

export interface InicioData {
  bienvenida?: Bienvenida | null;
  calendario?: CalendarioAg | null;
  indicadores: Indicador[];
  cooperativas: Cooperativa[];
}

