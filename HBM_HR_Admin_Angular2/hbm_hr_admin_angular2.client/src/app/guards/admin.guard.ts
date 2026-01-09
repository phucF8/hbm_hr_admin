import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let targetRoute = route;// 1. Tìm data 'permission' từ route hiện tại hoặc các route con
    // Duyệt sâu xuống route con cuối cùng để lấy data
    while (targetRoute.firstChild) {
      targetRoute = targetRoute.firstChild;
    }
    const requiredPermission = targetRoute.data['permission'];
    console.log("Quyền yêu cầu của trang này là:", requiredPermission);
    // 2. Logic kiểm tra Token (giữ nguyên code cũ của bạn)
    const token = localStorage.getItem('access_token');
    if (!token || this.authService.isTokenExpired()) {
      this.router.navigate(['/login']);
      return false;
    }
    // 3. Giải mã và kiểm tra quyền
    const decoded: any = jwtDecode(token);
    const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    // 4. Kiểm tra quyền cụ thể
    if (requiredPermission) {
      if (roles.includes(requiredPermission)) {
        return true;
      } else {
        console.warn(`User không có quyền: ${requiredPermission}`);
        this.router.navigate(['/forbidden']);
        return false;
      }
    }
    // Nếu không có yêu cầu permission cụ thể, chỉ cần có quyền admin chung (ví dụ ADMIN_VOTE)
    // if (roles.includes('ADMIN_VOTE')) {
      return true;
    // }
    // this.router.navigate(['/forbidden']);
    // return false;
  }
}