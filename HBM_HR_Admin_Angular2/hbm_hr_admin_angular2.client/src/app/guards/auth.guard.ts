import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ROUTE_PATHS } from '@app/app.routes';
import { LoginComponent } from '@app/components/login/login.component';
import { AuthService } from '@app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  canActivate(): boolean | UrlTree {
    if (this.authService.isTokenExpired()) {
      // Token hết hạn, logout
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    } else {
      const token = localStorage.getItem('access_token');
      if (token && token.trim() !== '') {
        return true;
      }
      // 👇 Chuyển hướng đúng cách
      this.router.navigate([ROUTE_PATHS.login]);
      return false;
    }

  }
}
