import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CultivosService } from '../services/cultivos-services';
import { CatalogoItem, Tarea } from '../model/cultivos-model';



@Component({
  selector: 'app-tarea-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './tarea-form-page.html',
  styleUrls: ['./tarea-form-page.scss'],
})
export class TareaFormPage implements OnInit {
  private srv = inject(CultivosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  cultivoId!: string;
  tareaId: string | null = null;
  tipos: CatalogoItem[] = [];
  estados: CatalogoItem[] = [];
  title = 'Crear tarea';
  loading = false;
  errorMsg = '';
  toastMsg = '';
  toastColor: 'success'|'warning'|'danger' = 'success';
  showToast = false;

  form = this.fb.group({
    tipo: ['', Validators.required],
    fechaProgramada: ['', Validators.required],
    estado: [''],
    notas: ['', Validators.maxLength(200)],
  });

  async ngOnInit() {
    this.cultivoId = this.route.snapshot.paramMap.get('id')!;
    this.tareaId = this.route.snapshot.paramMap.get('tareaId');
    // Cargar catálogos
    try {
      [this.tipos, this.estados] = await Promise.all([
        this.srv.listarTiposTarea(),
        this.srv.listarEstadosTarea(),
      ]);
    } catch (e: any) {
      this.alert('No fue posible cargar catálogos de tareas', 'danger');
    }
    if (this.tareaId) {
      this.title = 'Editar tarea';
      const t = await this.srv.obtenerTarea(this.cultivoId, this.tareaId);
      if (t) this.form.patchValue(t as any);
    }
  }

  async guardar() {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      const payload = this.form.value as any;
      // fecha >= hoy usando UTC para evitar desfases de zona horaria
      const hoy = new Date();
      const hoyUtc = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
      const fecha = new Date(`${payload.fechaProgramada}T00:00:00Z`);
      if (fecha < hoyUtc) throw new Error('La fecha no es valida, seleccione una mas reciente');

      if (this.tareaId) {
        await this.srv.actualizarTarea(this.cultivoId, this.tareaId, payload);
        this.alert('La tarea fue actualizada exitosamente', 'success');
      } else {
        const { estado, ...rest } = payload;
        await this.srv.crearTarea({ cultivoId: this.cultivoId, ...rest });
        this.alert('Tarea creada con éxito', 'success');
      }
      this.router.navigate(['/cultivos', this.cultivoId, 'tareas']);
    } catch (e: any) {
      const msg = e?.message || 'No se pudo actualizar la tarea, inténtelo nuevamente';
      this.alert(msg, 'danger');
      this.errorMsg = msg;
    } finally {
      this.loading = false;
    }
  }

  cancelar() { this.router.navigate(['/cultivos', this.cultivoId, 'tareas']); }

  private alert(msg: string, color: 'success'|'warning'|'danger') { this.toastMsg = msg; this.toastColor = color; this.showToast = true; }
}



