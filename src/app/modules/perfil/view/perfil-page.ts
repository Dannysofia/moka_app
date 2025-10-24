import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PerfilService } from '../services/perfil-services';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil-page.html',
  styleUrls: ['./perfil-page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class PerfilPage implements OnInit {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private toastController: ToastController,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)]
      ],
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  // Refresca datos al entrar en la vista
  async ionViewWillEnter() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      this.loading = true;
      const norm = await this.perfilService.getCurrentUserNormalized();
      console.log('[Perfil] normalizado:', norm);
      if (norm) {
        this.form.patchValue({
          nombre: norm.nombre,
          apellido: norm.apellidos,
          telefono: norm.telefono,
          correo: norm.correo,
        });
      }
    } catch (err: any) {
      console.error('[Perfil] Error cargando perfil:', err);
      this.errorMsg = err?.message ?? 'No se pudo cargar el perfil.';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      this.loading = true;
      const { nombre, apellido, telefono } = this.form.getRawValue();
      await this.perfilService.updateCurrentUserProfile({ nombre, apellido, telefono });
      this.successMsg = 'Perfil actualizado correctamente';
      await this.presentToast('Perfil actualizado correctamente');
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'No se pudo actualizar el perfil.';
    } finally {
      this.loading = false;
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }
}

export default PerfilPage;
