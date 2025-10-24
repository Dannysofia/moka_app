import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PersonalService } from '../services/personal.service';
import { Empleado, FormularioEmpleado } from '../model/personal.model';

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

  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  terminoBusqueda: string = '';
  mostrarModal: boolean = false;
  empleadoEditar: Empleado | null = null;

  formulario: FormularioEmpleado = {
    nombre: '',
    rol: '',
    telefono: '',
    email: '',
    estado: 'Activo'
  };

  constructor(private personalService: PersonalService) { }

  ngOnInit() {
    this.cargarEmpleados();
  }

  get empleadosActivos(): number {
    return this.personalService.contarActivos();
  }

  get empleadosInactivos(): number {
    return this.personalService.contarInactivos();
  }

  cargarEmpleados() {
    this.empleados = this.personalService.getEmpleados();
    this.empleadosFiltrados = [...this.empleados];
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
    if (this.formulario.email && !this.personalService.validarEmail(this.formulario.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    if (this.empleadoEditar) {
      // Editar empleado existente
      const resultado = this.personalService.actualizarEmpleado(
        this.empleadoEditar.id, 
        this.formulario
      );
      
      if (resultado) {
        alert('Empleado actualizado exitosamente');
      }
    } else {
      // Agregar nuevo empleado
      this.personalService.crearEmpleado(this.formulario);
      alert('Empleado creado exitosamente');
    }

    this.cargarEmpleados();
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
      const eliminado = this.personalService.eliminarEmpleado(id);
      
      if (eliminado) {
        alert('Empleado eliminado exitosamente');
        this.cargarEmpleados();
        this.filtrarEmpleados();
      } else {
        alert('Error al eliminar el empleado');
      }
    }
  }

  filtrarEmpleados() {
    this.empleadosFiltrados = this.personalService.filtrarEmpleados(this.terminoBusqueda);
  }

  obtenerIniciales(nombre: string): string {
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }
}