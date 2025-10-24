import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CultivosService } from '../services/cultivos-services';
import { Tarea } from '../model/cultivos-model';

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
  loading = true;
  toastMsg = '';
  toastColor: 'success' | 'warning' | 'danger' = 'success';
  showToast = false;

  async ngOnInit() {
    this.cultivoId = this.route.snapshot.paramMap.get('id')!;
    await this.cargarCultivo();
    await this.cargar();
  }

  // Refresca cuando se vuelve a esta vista
  async ionViewWillEnter() {
    await this.cargarCultivo();
    await this.cargar();
  }

  private async cargarCultivo() {
    try {
      const c = await this.srv.obtenerCultivo(this.cultivoId);
      this.cultivoNombre = c?.nombre;
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
}
