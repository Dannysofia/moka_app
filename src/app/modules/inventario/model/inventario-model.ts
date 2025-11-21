export type Categoria = 'Insumos' | 'Herramientas' | 'Empaques' | 'Otro';

export interface Producto {
  id: string; // uuid en Supabase
  nombre: string; // max 80, required, unique per category
  descripcion?: string; // max 250, optional
  categoria: Categoria; // required
  cantidad: number; // integer >= 0, required
  created_at?: string;
}

export interface CrearProductoDto {
  nombre: string;
  descripcion?: string;
  categoria: Categoria;
  cantidad: number;
}

export interface Resultado<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function validarProducto(input: CrearProductoDto): string | null {
  if (!input.nombre || input.nombre.trim().length === 0) {
    return 'Complete el campo [nombre]';
  }
  if (input.nombre.trim().length > 80) {
    return 'El nombre no debe exceder 80 caracteres';
  }
  if (!input.categoria) {
    return 'Complete el campo [categoría]';
  }
  const categorias: Categoria[] = ['Insumos', 'Herramientas', 'Empaques', 'Otro'];
  if (!categorias.includes(input.categoria)) {
    return 'Categoría inválida';
  }
  if (input.descripcion && input.descripcion.trim().length > 250) {
    return 'La descripción no debe exceder 250 caracteres';
  }
  if (input.cantidad == null || Number.isNaN(input.cantidad)) {
    return 'Complete el campo [cantidad]';
  }
  if (!Number.isInteger(input.cantidad) || input.cantidad < 0) {
    return 'La cantidad debe ser un entero mayor o igual a 0';
  }
  return null;
}

export function estadoStock(
  _categoria: Categoria,
  cantidad: number
): 'Suficiente' | 'Bajo' | 'Agotado' {
  if (cantidad <= 0) return 'Agotado';
  if (cantidad <= 5) return 'Bajo';
  return 'Suficiente';
}
