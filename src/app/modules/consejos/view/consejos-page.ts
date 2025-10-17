import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConsejosService } from '../services/consejos-services';
import { Consejo } from '../model/consejos-model';

@Component({
  selector: 'app-consejos',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './consejos-page.html',
  styleUrls: ['./consejos-page.scss'],
})
export class ConsejosPage implements OnInit {
  loading = true;
  consejos: Consejo[] = [];
  toastMsg = '';
  toastColor: 'warning' | 'danger' | 'success' = 'warning';
  showToast = false;

  private srv = inject(ConsejosService);
  private router = inject(Router);

  async ngOnInit() {
    await this.cargar();
  }

  async onRefresh(event?: any) {
    try {
      await this.cargar();
    } finally {
      event?.target?.complete?.();
    }
  }

  trackById(_i: number, c: Consejo) { return c.id; }

  private async cargar() {
    this.loading = true;
    try {
      this.consejos = await this.srv.listarConsejos();
      if (!this.consejos?.length) {
        this.alert('Aún no hay consejos disponibles');
      }
    } catch (e: any) {
      this.alert('No fue posible cargar los consejos, inténtelo nuevamente', 'danger');
    } finally {
      this.loading = false;
    }
  }

  verDetalle(id: string) { this.router.navigate(['/consejos', id]); }

  private alert(msg: string, color: 'warning' | 'danger' | 'success' = 'warning') {
    this.toastMsg = msg; this.toastColor = color; this.showToast = true;
  }
}
