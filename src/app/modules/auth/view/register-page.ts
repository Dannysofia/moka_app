import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-services';

@Component({
  selector: 'app-register',
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
  standalone: false,
})
export class RegisterPage {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      apellido: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[A-Za-z\s]+$/)]],
      telefono: ['', [Validators.pattern(/^(\d{10})?$/)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
    });
  }

  async onSubmit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const { nombre, apellido, telefono, correo, password } = this.form.value;
      // 1. Registrar usuario en Supabase Auth
      const data = await this.authService.register(correo, password);
      const user = data.user || (data as any).user;
      if (!user || !user.id) throw new Error('No se pudo registrar el usuario');
      // 2. Guardar datos extra en caficultores
      await this.authService.saveCaficultor({
        nombre,
        apellido,
        telefono,
        user_id: user.id,
      });
      // 3. Redirigir al login con bandera de registro exitoso
      await this.router.navigate(['/auth/login'], { queryParams: { registered: '1' } });
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al registrar usuario';
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  onOnlyLettersInput(controlName: 'nombre' | 'apellido', event: CustomEvent) {
    const value = (event.detail as any)?.value ?? '';
    const cleaned = value.toString().replace(/[^A-Za-z\s]/g, '');
    if (cleaned !== value) {
      this.form.get(controlName)?.setValue(cleaned, { emitEvent: false });
    }
  }

  onTelefonoInput(event: CustomEvent) {
    const value = (event.detail as any)?.value ?? '';
    const digits = value.toString().replace(/\D/g, '').slice(0, 10);
    if (digits !== value) {
      this.form.get('telefono')?.setValue(digits, { emitEvent: false });
    }
  }
}
