import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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

  async ngOnInit() {
    this.route.queryParamMap.subscribe((p) => {
      const saved = p.get('saved');
      const msg = p.get('msg');
      if (saved === '1' && msg) {
        this.alert(msg, 'success');
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
      if (!this.cultivos.length) {
        this.alert('Aún no tiene cultivos registrados, cree el primero para empezar', 'warning');
      }
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
    const ok = confirm('¿Está seguro de eliminar este cultivo?');
    if (!ok) return;
    try {
      await this.srv.eliminarCultivo(c.id);
      this.alert('El cultivo fue eliminado exitosamente', 'success');
      this.cargar();
    } catch (e: any) {
      this.alert('No se pudo eliminar el cultivo, inténtelo nuevamente', 'danger');
    }
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
}
