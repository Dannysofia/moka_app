import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Empleado {
  id: number;
  nombre: string;
  rol: string;
  telefono?: string;
  email?: string;
  estado: string;
}

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class PersonalPage implements OnInit {

  empleados: Empleado[] = [
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

  empleadosFiltrados: Empleado[] = [];
  terminoBusqueda: string = '';
  mostrarModal: boolean = false;
  empleadoEditar: Empleado | null = null;

  formulario = {
    nombre: '',
    rol: '',
    telefono: '',
    email: '',
    estado: 'Activo'
  };

  constructor() { }

  ngOnInit() {
    this.empleadosFiltrados = [...this.empleados];
  }

  get empleadosActivos(): number {
    return this.empleados.filter(e => e.estado === 'Activo').length;
  }

  get empleadosInactivos(): number {
    return this.empleados.filter(e => e.estado === 'Inactivo').length;
  }

  abrirModalRegistro() {
    this.empleadoEditar = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.formulario = {
      nombre: '',
      rol: '',
      telefono: '',
      email: '',
      estado: 'Activo'
    };
  }

  guardarEmpleado() {
    // Validaciones
    if (!this.formulario.nombre || !this.formulario.rol || !this.formulario.estado) {
      alert('Por favor completa los campos obligatorios: Nombre, Rol y Estado');
      return;
    }

    if (this.formulario.nombre.length > 80) {
      alert('El nombre no puede exceder 80 caracteres');
      return;
    }

    // Validar email si existe
    if (this.formulario.email && !this.validarEmail(this.formulario.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    if (this.empleadoEditar) {
      // Editar empleado existente
      const index = this.empleados.findIndex(e => e.id === this.empleadoEditar!.id);
      this.empleados[index] = {
        ...this.empleados[index],
        nombre: this.formulario.nombre,
        rol: this.formulario.rol,
        telefono: this.formulario.telefono,
        email: this.formulario.email,
        estado: this.formulario.estado
      };
    } else {
      // Agregar nuevo empleado
      const nuevoEmpleado: Empleado = {
        id: Date.now(),
        nombre: this.formulario.nombre,
        rol: this.formulario.rol,
        telefono: this.formulario.telefono || undefined,
        email: this.formulario.email || undefined,
        estado: this.formulario.estado
      };
      this.empleados.unshift(nuevoEmpleado);
    }

    this.filtrarEmpleados();
    this.cerrarModal();
  }

  editarEmpleado(empleado: Empleado) {
    this.empleadoEditar = empleado;
    this.formulario = {
      nombre: empleado.nombre,
      rol: empleado.rol,
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      estado: empleado.estado
    };
    this.mostrarModal = true;
  }

  eliminarEmpleado(id: number) {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      this.empleados = this.empleados.filter(e => e.id !== id);
      this.filtrarEmpleados();
    }
  }

  filtrarEmpleados() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.empleadosFiltrados = [...this.empleados];
    } else {
      this.empleadosFiltrados = this.empleados.filter(e =>
        e.nombre.toLowerCase().includes(termino) ||
        e.rol.toLowerCase().includes(termino)
      );
    }
  }

  obtenerIniciales(nombre: string): string {
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

}