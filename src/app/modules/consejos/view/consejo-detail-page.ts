import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ConsejosService } from '../services/consejos-services';
import { Consejo } from '../model/consejos-model';

@Component({
  selector: 'app-consejo-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './consejo-detail-page.html',
  styleUrls: ['./consejo-detail-page.scss'],
})
export class ConsejoDetailPage implements OnInit {
  loading = true;
  consejo: Consejo | null = null;
  showToast = false;
  toastMsg = '';
  toastColor: 'success' | 'warning' | 'danger' = 'success';

  private route = inject(ActivatedRoute);
  private srv = inject(ConsejosService);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (!id) {
      this.alert('No fue posible cargar el consejo seleccionado', 'danger');
      this.loading = false;
      return;
    }
    try {
      this.consejo = await this.srv.obtenerConsejo(id);
      if (!this.consejo) {
        this.alert('No fue posible cargar el consejo seleccionado', 'danger');
        return;
      }
      this.alert('Consejo cargado correctamente', 'success');
    } catch (e) {
      this.alert('No fue posible cargar el consejo seleccionado', 'danger');
    } finally {
      this.loading = false;
    }
  }

  get fechaPublicacion(): string | null {
    const f = this.consejo?.fecha_publicacion;
    if (!f) return null;
    try { return new Date(f).toLocaleDateString('es-CO'); } catch { return f; }
  }

  get fuenteLabel(): string | null {
    const url = this.consejo?.fuente_url?.trim();
    if (!url) return null;
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '');
    }
  }

  private alert(msg: string, color: 'success' | 'warning' | 'danger' = 'success') {
    this.toastMsg = msg; this.toastColor = color; this.showToast = true;
  }
}
