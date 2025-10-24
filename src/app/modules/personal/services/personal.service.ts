import { Injectable } from '@angular/core';
import { Empleado, FormularioEmpleado } from '../model/personal.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {

  private empleados: Empleado[] = [
    {
      id: 1,
      nombre: 'Carlos Martínez',
      rol: 'Capataz',
      telefono: '310 456 7890',
      email: 'carlos.martinez@email.com',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'María González',
      rol: 'Jornalero',
      telefono: '315 678 9012',
      estado: 'Activo'
    },
    {
      id: 3,
      nombre: 'Juan Rodríguez',
      rol: 'Administrador',
      telefono: '320 789 1234',
      email: 'juan.rodriguez@email.com',
      estado: 'Inactivo'
    }
  ];

  constructor() { }

  /**
   * Obtener todos los empleados
   */
  getEmpleados(): Empleado[] {
    return [...this.empleados];
  }

  /**
   * Obtener empleado por ID
   */
  getEmpleadoPorId(id: number): Empleado | undefined {
    return this.empleados.find(e => e.id === id);
  }

  /**
   * Crear nuevo empleado
   */
  crearEmpleado(formulario: FormularioEmpleado): Empleado {
    const nuevoEmpleado: Empleado = {
      id: Date.now(),
      nombre: formulario.nombre,
      rol: formulario.rol,
      telefono: formulario.telefono || undefined,
      email: formulario.email || undefined,
      estado: formulario.estado
    };
    
    this.empleados.unshift(nuevoEmpleado);
    return nuevoEmpleado;
  }

  /**
   * Actualizar empleado existente
   */
  actualizarEmpleado(id: number, formulario: FormularioEmpleado): Empleado | null {
    const index = this.empleados.findIndex(e => e.id === id);
    
    if (index !== -1) {
      this.empleados[index] = {
        ...this.empleados[index],
        nombre: formulario.nombre,
        rol: formulario.rol,
        telefono: formulario.telefono || undefined,
        email: formulario.email || undefined,
        estado: formulario.estado
      };
      return this.empleados[index];
    }
    
    return null;
  }

  /**
   * Eliminar empleado
   */
  eliminarEmpleado(id: number): boolean {
    const index = this.empleados.findIndex(e => e.id === id);
    
    if (index !== -1) {
      this.empleados.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Filtrar empleados por término de búsqueda
   */
  filtrarEmpleados(termino: string): Empleado[] {
    const terminoLower = termino.toLowerCase().trim();
    
    if (!terminoLower) {
      return this.getEmpleados();
    }
    
    return this.empleados.filter(e =>
      e.nombre.toLowerCase().includes(terminoLower) ||
      e.rol.toLowerCase().includes(terminoLower)
    );
  }

  /**
   * Contar empleados activos
   */
  contarActivos(): number {
    return this.empleados.filter(e => e.estado === 'Activo').length;
  }

  /**
   * Contar empleados inactivos
   */
  contarInactivos(): number {
    return this.empleados.filter(e => e.estado === 'Inactivo').length;
  }

  /**
   * Validar email
   */
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}