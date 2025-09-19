import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ROUTE_PATHS } from '@app/app.routes';
import { LoginComponent } from '@app/components/login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('access_token');
    if (token && token.trim() !== '') {
      return true;
    }
    // 👇 Chuyển hướng đúng cách
    this.router.navigate([ROUTE_PATHS.login]);
    return false;
  }
}
