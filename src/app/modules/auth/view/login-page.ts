import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth-services';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  standalone: false,
})
export class LoginPage {
  show = false;
  form!: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';
  toastOpen = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Mostrar mensaje si viene de registro exitoso
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('registered') === '1') {
        this.successMsg = 'Registro exitoso. Ahora inicia sesión.';
        this.toastOpen = true;
      }
    });
  }

  toggleShow() {
    this.show = !this.show;
  }

  async onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.loading = true;
    try {
      const result = await this.authService.login(email, password);
      // Redirigir a la página de inicio si el login es exitoso
      await this.router.navigate(['/inicio']);
    } catch (error: any) {
      this.errorMsg = error.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
