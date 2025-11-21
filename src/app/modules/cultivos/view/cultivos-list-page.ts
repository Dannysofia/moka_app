import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CultivosService } from '../services/cultivos-services';
import { Cultivo } from '../model/cultivos-model';

@Component({
  selector: 'app-cultivos-list',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './cultivos-list-page.html',
  styleUrls: ['./cultivos-list-page.scss'],
})
export class CultivosListPage implements OnInit {
  loading = true;
  error = '';
  cultivos: Cultivo[] = [];
  searchTerm = '';

  toastMsg = '';
  toastColor: 'success' | 'warning' | 'danger' = 'success';
  showToast = false;

  private srv = inject(CultivosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertCtrl = inject(AlertController);

  async ngOnInit() {
    this.route.queryParamMap.subscribe((p) => {
      const saved = p.get('saved');
      const msg = p.get('msg');
      if (saved === '1' && msg) {
        this.alert(msg, 'success');
        // Limpia los query params para evitar mostrar el toast en navegaciones posteriores
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { saved: null, msg: null },
          replaceUrl: true,
        });
      }
    });
    this.cargar();
  }

  // Refresca cada vez que la vista entra en foco
  async ionViewWillEnter() {
    await this.cargar();
  }

  async cargar() {
    this.loading = true;
    this.error = '';
    try {
      this.cultivos = await this.srv.listarCultivos();
    } catch (e: any) {
      this.alert('No fue posible cargar los cultivos, inténtelo nuevamente', 'danger');
      this.error = e?.message || 'Error';
    } finally {
      this.loading = false;
    }
  }

  crear() { this.router.navigateByUrl('/cultivos/nuevo'); }
  editar(id: string) { this.router.navigate(['/cultivos', id, 'editar']); }
  verTareas(id: string) { this.router.navigate(['/cultivos', id, 'tareas']); }
  
  async eliminar(c: Cultivo) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Desea eliminar este cultivo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.srv.eliminarCultivo(c.id);
              this.alert('El cultivo fue eliminado exitosamente', 'success');
              this.cargar();
            } catch {
              this.alert('No se pudo eliminar el cultivo, inténtelo nuevamente', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private alert(msg: string, color: 'success' | 'warning' | 'danger' = 'success') {
    this.toastMsg = msg; this.toastColor = color; this.showToast = true;
  }

  async onRefresh(event: any) {
    try {
      await this.cargar();
    } finally {
      event?.target?.complete?.();
    }
  }

  get filteredCultivos(): Cultivo[] {
    const term = this.searchTerm?.trim().toLowerCase();
    if (!term) return this.cultivos;
    return this.cultivos.filter(c => {
      const values = [c.nombre, c.tipo, c.fechaSiembra, String(c.area ?? '')];
      return values.some(v => (v || '').toString().toLowerCase().includes(term));
    });
  }

  get emptyStateText(): string {
    const term = this.searchTerm?.trim();
    if (term) {
      return 'No se encontraron cultivos que coincidan con la búsqueda';
    }
    return 'Aún no tiene cultivos registrados, cree el primero para empezar';
  }
}
