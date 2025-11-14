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
  editando: Producto | null = null;
  terminoBusqueda: string = '';
  page = 1;
  pageSize = 10;
  total = 0;
  hasMore = false;

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
    const res = await this.inv.listarPaginado(this.page, this.pageSize, this.terminoBusqueda);
    if (res.ok) {
      const r = res.data!;
      this.productos = r.items;
      this.total = r.total;
      this.hasMore = r.hasMore;
    } else {
      this.error = res.error || 'Error al consultar productos';
      this.productos = [];
      this.total = 0;
      this.hasMore = false;
    }
    this.cargando = false;
    if (event?.target?.complete) event.target.complete();
  }

  alternarFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editando = null;
    }
  }

  async buscar() {
    this.page = 1;
    await this.cargarProductos();
  }

  async siguiente() {
    if (!this.hasMore) return;
    this.page += 1;
    await this.cargarProductos();
  }

  async anterior() {
    if (this.page === 1) return;
    this.page -= 1;
    await this.cargarProductos();
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
    const payload: CrearProductoDto = {
      nombre: this.form.nombre?.trim(),
      descripcion: this.form.descripcion?.trim() || undefined,
      categoria: this.form.categoria,
      cantidad: Number(this.form.cantidad),
    };

    const res = this.editando
      ? await this.inv.actualizar(this.editando.id, payload)
      : await this.inv.crear(payload);

    if (!res.ok) {
      await this.presentarToast(res.error || (this.editando ? 'No se pudo actualizar' : 'No se pudo guardar'), 'danger');
      return;
    }

    if (this.getEstado(this.form.cantidad, this.form.categoria) === 'Bajo') {
      await this.presentarToast('Este producto está con stock bajo', 'warning');
    }

    await this.presentarToast(this.editando ? 'Cambios guardados correctamente' : 'Producto guardado con éxito', 'success');
    this.limpiarFormulario();
    this.editando = null;
    this.mostrarFormulario = false;
    this.cargarProductos();
  }

  getEstado(cantidad: number, categoria?: Categoria) {
    const cat = categoria ?? this.form.categoria;
    return estadoStock(cat, cantidad);
  }

  getBadgeColor(cantidad: number, categoria?: Categoria) {
    const s = this.getEstado(cantidad, categoria);
    if (s === 'Suficiente') return 'success';
    if (s === 'Bajo') return 'warning';
    return 'danger';
  }

  getCardClass(cantidad: number, categoria?: Categoria): string {
    const s = this.getEstado(cantidad, categoria);
    if (s === 'Suficiente') return 'estado-suficiente';
    if (s === 'Bajo') return 'estado-bajo';
    return 'estado-agotado';
  }

  getEstadoIcon(cantidad: number, categoria?: Categoria): string {
    const s = this.getEstado(cantidad, categoria);
    if (s === 'Suficiente') return 'checkmark-circle-outline';
    if (s === 'Bajo') return 'alert-circle-outline';
    return 'close-circle-outline';
  }

  private async presentarToast(message: string, color: 'success' | 'warning' | 'danger') {
    const t = await this.toast.create({ message, color, duration: 2000, position: 'top' });
    await t.present();
  }

  editar(p: Producto) {
    this.editando = p;
    this.form = {
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      categoria: p.categoria,
      cantidad: p.cantidad,
    };
    this.mostrarFormulario = true;
  }

  async eliminar(p: Producto) {
    const ok = confirm('¿Desea eliminar este producto?');
    if (!ok) return;
    const res = await this.inv.eliminar(p.id);
    if (!res.ok) {
      await this.presentarToast(res.error || 'No se pudo eliminar el producto, inténtelo nuevamente', 'danger');
      return;
    }
    await this.presentarToast('Producto eliminado con éxito', 'success');
    // Si borramos el último de la página y no hay más, retrocedemos de página
    if (this.productos.length === 1 && this.page > 1) {
      this.page -= 1;
    }
    this.cargarProductos();
  }
}
