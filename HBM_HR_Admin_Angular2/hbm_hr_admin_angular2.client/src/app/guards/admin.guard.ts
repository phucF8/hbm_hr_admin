import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ROUTE_PATHS } from '@app/app.routes';
import { LoginComponent } from '@app/components/login/login.component';
import { AuthService } from '@app/services/auth.service';
import { showJsonDebug } from '@app/utils/error-handler';
import { safeStringify } from '@app/utils/json-utils';
import { jwtDecode } from 'jwt-decode';


interface JwtPayload {
  role: string[] | string;
  name: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  canActivate(): boolean {
    if (this.authService.isTokenExpired()) {
      // Token hết hạn, logout
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    } else {
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }
      const decoded: any = jwtDecode(token);
      const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];  // lấy role từ claim chuẩn của ASP.NET
      const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
      console.log("Roles:", safeStringify(decoded));
      if (roles.includes('ADMIN_VOTE')) {
        return true;
      }
      this.router.navigate(['/forbidden']); // trang báo lỗi
      return false;
    }

  }

}
