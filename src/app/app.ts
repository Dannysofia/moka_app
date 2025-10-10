import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './modules/auth/services/auth-services';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: false,
})
export class App {
  constructor(private auth: AuthService, private router: Router) {}

  async onLogout(): Promise<void> {
    try {
      await this.auth.logout();
    } finally {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
    }
  }
}
