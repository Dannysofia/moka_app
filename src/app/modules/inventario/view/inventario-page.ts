import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import {
  Categoria,
  CrearProductoDto,
  Producto,
  estadoStock,
} from '../model/inventario-model';
import { InventarioServices } from '../services/inventario-services';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario-page.html',
  styleUrls: ['./inventario-page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class InventarioPage implements OnInit {
  productos: Producto[] = [];
  cargando = false;
  error = '';
  mostrarFormulario = false;

  form: CrearProductoDto = {
    nombre: '',
    descripcion: '',
    categoria: 'Insumos',
    cantidad: 0,
  };

  categorias: Categoria[] = ['Insumos', 'Herramientas', 'Empaques', 'Otro'];

  constructor(
    private readonly inv: InventarioServices,
    private readonly toast: ToastController
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  async cargarProductos(event?: any) {
    this.cargando = !event;
    this.error = '';
    const res = await this.inv.listar();
    if (res.ok) {
      this.productos = res.data!;
    } else {
      this.error = res.error || 'Error al consultar productos';
      this.productos = [];
    }
    this.cargando = false;
    if (event?.target?.complete) event.target.complete();
  }

  alternarFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  limpiarFormulario() {
    this.form = {
      nombre: '',
      descripcion: '',
      categoria: 'Insumos',
      cantidad: 0,
    };
  }

  async guardar() {
    const res = await this.inv.crear({
      nombre: this.form.nombre?.trim(),
      descripcion: this.form.descripcion?.trim() || undefined,
      categoria: this.form.categoria,
      cantidad: Number(this.form.cantidad),
    });

    if (!res.ok) {
      await this.presentarToast(res.error || 'No se pudo guardar', 'danger');
      return;
    }

    await this.presentarToast('Producto guardado con éxito', 'success');
    this.limpiarFormulario();
    this.mostrarFormulario = false;
    this.cargarProductos();
  }

  getEstado(cantidad: number) {
    return estadoStock(cantidad);
  }

  getBadgeColor(cantidad: number) {
    const s = estadoStock(cantidad);
    if (s === 'Suficiente') return 'success';
    if (s === 'Bajo') return 'warning';
    return 'danger';
  }

  private async presentarToast(message: string, color: 'success' | 'warning' | 'danger') {
    const t = await this.toast.create({ message, color, duration: 2000, position: 'top' });
    await t.present();
  }
}
