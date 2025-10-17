export interface Consejo {
  id: string;
  titulo: string;
  contenido: string | null;
  categoria: string | null;
  fuente_url: string | null;
  fecha_publicacion: string | null; // ISO date (YYYY-MM-DD)
  visibilidad: 'activo' | 'inactivo' | string;
  created_at: string | null; // ISO datetime
  imagen_url: string | null;
}
