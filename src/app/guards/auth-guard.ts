import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router, UrlTree, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../modules/auth/services/auth-services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanMatch {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      const loggedIn = await this.auth.isLoggedIn();
      return loggedIn ? true : this.router.createUrlTree(['/auth']);
    } catch (e) {
      return this.router.createUrlTree(['/auth']);
    }
  }

  async canMatch(_route: Route, _segments: UrlSegment[]): Promise<boolean | UrlTree> {
    try {
      const loggedIn = await this.auth.isLoggedIn();
      return loggedIn ? true : this.router.createUrlTree(['/auth']);
    } catch (e) {
      return this.router.createUrlTree(['/auth']);
    }
  }
}
