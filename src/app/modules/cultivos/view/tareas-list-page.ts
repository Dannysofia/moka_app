import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CultivosService } from '../services/cultivos-services';
import { CatalogoItem, Tarea } from '../model/cultivos-model';

@Component({
  selector: 'app-tareas-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './tareas-list-page.html',
  styleUrls: ['./tareas-list-page.scss'],
})
export class TareasListPage implements OnInit {
  private srv = inject(CultivosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertCtrl = inject(AlertController);

  cultivoId!: string;
  cultivoNombre: string | undefined;
  tareas: Tarea[] = [];
  tiposTareaMap = new Map<string, string>();
  estadosTareaMap = new Map<string, string>();
  loading = true;
  toastMsg = '';
  toastColor: 'success' | 'warning' | 'danger' = 'success';
  showToast = false;

  async ngOnInit() {
    this.cultivoId = this.route.snapshot.paramMap.get('id')!;
    await this.cargarCultivo();
    await this.cargarTiposTarea();
    await this.cargarEstadosTarea();
    await this.cargar();
  }

  // Refresca cuando se vuelve a esta vista
  async ionViewWillEnter() {
    await this.cargarCultivo();
    await this.cargarTiposTarea(true);
    await this.cargarEstadosTarea(true);
    await this.cargar();
  }

  private async cargarCultivo() {
    try {
      const c = await this.srv.obtenerCultivo(this.cultivoId);
      this.cultivoNombre = c?.nombre;
    } catch {}
  }

  private async cargarEstadosTarea(force = false) {
    if (this.estadosTareaMap.size && !force) return;
    try {
      const estados = await this.srv.listarEstadosTarea();
      this.estadosTareaMap.clear();
      estados.forEach((e: CatalogoItem) => this.estadosTareaMap.set(e.codigo, e.nombre));
    } catch {}
  }

  private async cargarTiposTarea(force = false) {
    if (this.tiposTareaMap.size && !force) return;
    try {
      const tipos = await this.srv.listarTiposTarea();
      this.tiposTareaMap.clear();
      tipos.forEach((t: CatalogoItem) => this.tiposTareaMap.set(t.codigo, t.nombre));
    } catch {}
  }

  async cargar() {
    this.loading = true;
    try {
      this.tareas = await this.srv.listarTareas(this.cultivoId);
      if (!this.tareas.length)
        this.alert('Este cultivo aún no tiene tareas registradas', 'warning');
    } catch {
      this.alert('No fue posible cargar las tareas, inténtelo nuevamente', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async onRefresh(event: any) {
    try {
      await this.cargar();
    } finally {
      event?.target?.complete?.();
    }
  }

  crear() {
    this.router.navigate(['/cultivos', this.cultivoId, 'tareas', 'nueva']);
  }
  editar(t: Tarea) {
    this.router.navigate(['/cultivos', this.cultivoId, 'tareas', t.id, 'editar']);
  }

  async eliminar(t: Tarea) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Desea eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.srv.eliminarTarea(this.cultivoId, t.id);
              this.alert('La tarea fue eliminada exitosamente', 'success');
              this.cargar();
            } catch (e: any) {
              this.alert(
                e?.message || 'No se pudo eliminar la tarea, inténtelo nuevamente',
                'danger'
              );
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private alert(msg: string, color: 'success' | 'warning' | 'danger') {
    this.toastMsg = msg;
    this.toastColor = color;
    this.showToast = true;
  }

  statusClass(estado: string | undefined): string {
    const e = (estado || '').toString().toLowerCase();
    if (e.startsWith('comp')) return 'completed'; // Completada / COMPLETADA / COMP
    if (e.startsWith('proc')) return 'processed'; // Procesada / PROCESADA / PROC
    return 'pending'; // Pendiente / PENDIENTE / PEND
  }

  tipoNombre(codigo: string | undefined): string {
    if (!codigo) return 'Tipo sin definir';
    return this.tiposTareaMap.get(codigo) || codigo;
  }

  estadoNombre(codigo: string | undefined): string {
    if (!codigo) return 'Estado sin definir';
    return this.estadosTareaMap.get(codigo) || codigo;
  }
}
