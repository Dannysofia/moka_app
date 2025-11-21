import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CultivosService } from '../services/cultivos-services';
import { CatalogoItem } from '../model/cultivos-model';

@Component({
  selector: 'app-cultivo-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './cultivo-form-page.html',
  styleUrls: ['./cultivo-form-page.scss'],
})
export class CultivoFormPage implements OnInit {
  private srv = inject(CultivosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  id: string | null = null;
  tipos: CatalogoItem[] = [];
  title = 'Crear cultivo';
  loading = false;
  errorMsg = '';
  toastMsg = '';
  toastColor: 'success'|'warning'|'danger' = 'success';
  showToast = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    tipo: ['', Validators.required],
    fechaSiembra: ['', Validators.required],
    area: [null as any, [Validators.required, Validators.min(0.01)]],
    notas: ['', [Validators.maxLength(250)]],
  });

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    // Cargar catálogos
    try {
      this.tipos = await this.srv.listarTiposCultivo();
    } catch (e: any) {
      this.alert('No fue posible cargar tipos de cultivo', 'danger');
    }
    if (this.id) {
      this.title = 'Editar cultivo';
      const item = await this.srv.obtenerCultivo(this.id);
      if (item) this.form.patchValue(item as any);
    }
  }

  async guardar() {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      const payload = this.form.value as any;

      if (this.id) {
        await this.srv.actualizarCultivo(this.id, payload);
        this.router.navigate(['/cultivos'], { queryParams: { saved: '1', msg: 'Cambios guardados correctamente' } });
      } else {
        await this.srv.crearCultivo(payload);
        this.router.navigate(['/cultivos'], { queryParams: { saved: '1', msg: 'Cultivo creado con éxito' } });
      }
    } catch (e: any) {
      const msg = e?.message || 'No se pudo actualizar el cultivo, inténtelo nuevamente';
      this.alert(msg, 'danger');
      this.errorMsg = msg;
    } finally {
      this.loading = false;
    }
  }

  cancelar() { this.router.navigateByUrl('/cultivos'); }

  irATareas() {
    if (this.id) {
      this.router.navigate(['/cultivos', this.id, 'tareas']);
    }
  }

  private alert(msg: string, color: 'success'|'warning'|'danger') {
    this.toastMsg = msg; this.toastColor = color; this.showToast = true;
  }
}
