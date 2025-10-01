import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-services';

@Component({
  selector: 'app-register',
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
  standalone: false
})
export class RegisterPage {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    this.errorMsg = '';
    if (this.form.invalid) return;
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
        user_id: user.id
      });
      // 3. Redirigir al login
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al registrar usuario';
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
