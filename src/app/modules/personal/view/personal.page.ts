import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
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

  // Estados de carga
  cargando: boolean = false;
  error: boolean = false;
  mensajeError: string = '';

  // Estadísticas
  totalEmpleados: number = 0;
  empleadosActivos: number = 0;
  empleadosInactivos: number = 0;

  formulario: FormularioEmpleado = {
    nombres: '',
    apellidos: '',
    documento: '',
    telefono: '',
    rol: '',
    fecha_ingreso: '',
    salario: '',
    estado: 'activo',
    direccion: ''
  };

  // Usuario temporal - Se genera un UUID para cada empleado
  usuarioId: string = this.generarUUID();

  constructor(
    private personalService: PersonalService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarEmpleados();
    this.cargarEstadisticas();
  }

  /**
   * Generar UUID temporal
   */
  generarUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Cargar empleados desde Supabase
   */
  async cargarEmpleados() {
    this.cargando = true;
    this.error = false;
    this.mensajeError = '';

    try {
      this.empleados = await this.personalService.getEmpleados();
      this.empleadosFiltrados = [...this.empleados];
      this.cargando = false;
      console.log('✅ Empleados cargados:', this.empleados.length);
    } catch (err: any) {
      this.error = true;
      this.mensajeError = err.message || 'No fue posible cargar los empleados';
      this.cargando = false;
      console.error('❌ Error al cargar empleados:', err);
      await this.mostrarToast('Error al cargar empleados', 'danger');
    }
  }

  /**
   * Cargar estadísticas
   */
  async cargarEstadisticas() {
    try {
      const stats = await this.personalService.getEstadisticas();
      this.totalEmpleados = stats.total;
      this.empleadosActivos = stats.activos;
      this.empleadosInactivos = stats.inactivos;
      console.log('📊 Estadísticas:', stats);
    } catch (err: any) {
      console.error('❌ Error al cargar estadísticas:', err);
    }
  }

  /**
   * Recargar datos
   */
  async recargar() {
    const loading = await this.loadingController.create({
      message: 'Recargando...'
    });
    await loading.present();

    await this.cargarEmpleados();
    await this.cargarEstadisticas();
    
    await loading.dismiss();
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
      nombres: '',
      apellidos: '',
      documento: '',
      telefono: '',
      rol: '',
      fecha_ingreso: '',
      salario: '',
      estado: 'activo',
      direccion: ''
    };
  }

  async guardarEmpleado() {
    // Validaciones
    if (!this.formulario.nombres || !this.formulario.apellidos) {
      await this.mostrarAlerta(
        'Campos obligatorios',
        'Por favor completa los campos: Nombres y Apellidos'
      );
      return;
    }

    const loading = await this.loadingController.create({
      message: this.empleadoEditar ? 'Actualizando...' : 'Guardando...'
    });
    await loading.present();

    try {
      if (this.empleadoEditar) {
        // Editar empleado existente
        await this.personalService.actualizarEmpleado(
          this.empleadoEditar.id,
          this.formulario
        );
        await this.mostrarToast('✅ Empleado actualizado exitosamente', 'success');
      } else {
        // Agregar nuevo empleado - Generar nuevo UUID para cada empleado
        const nuevoUsuarioId = this.generarUUID();
        await this.personalService.crearEmpleado(this.formulario, nuevoUsuarioId);
        await this.mostrarToast('✅ Empleado creado exitosamente', 'success');
      }

      await loading.dismiss();
      await this.cargarEmpleados();
      await this.cargarEstadisticas();
      this.filtrarEmpleados();
      this.cerrarModal();
    } catch (err: any) {
      await loading.dismiss();
      await this.mostrarAlerta(
        'Error',
        err.message || 'No se pudo guardar el empleado'
      );
      console.error('❌ Error al guardar empleado:', err);
    }
  }

  editarEmpleado(empleado: Empleado) {
    this.empleadoEditar = empleado;
    this.formulario = {
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
      documento: empleado.documento || '',
      telefono: empleado.telefono || '',
      rol: empleado.rol || '',
      fecha_ingreso: empleado.fecha_ingreso 
        ? empleado.fecha_ingreso.toISOString().split('T')[0] 
        : '',
      salario: empleado.salario ? empleado.salario.toString() : '',
      estado: empleado.estado,
      direccion: empleado.direccion || ''
    };
    this.mostrarModal = true;
  }

  async eliminarEmpleado(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...'
            });
            await loading.present();

            try {
              await this.personalService.eliminarEmpleado(id);
              await loading.dismiss();
              await this.mostrarToast('✅ Empleado eliminado exitosamente', 'success');
              await this.cargarEmpleados();
              await this.cargarEstadisticas();
              this.filtrarEmpleados();
            } catch (err: any) {
              await loading.dismiss();
              await this.mostrarAlerta('Error', err.message || 'No se pudo eliminar el empleado');
              console.error('❌ Error al eliminar empleado:', err);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  filtrarEmpleados() {
    this.empleadosFiltrados = this.personalService.filtrarEmpleados(
      this.empleados,
      this.terminoBusqueda
    );
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '??';
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  /**
   * Mostrar alerta
   */
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Mostrar toast
   */
  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}