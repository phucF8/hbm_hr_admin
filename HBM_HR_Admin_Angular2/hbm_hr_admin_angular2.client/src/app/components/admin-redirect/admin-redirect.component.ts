import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserPermission } from '@app/models/user.model';
import { AuthService } from '@app/services/auth.service';
import { getLocal } from '@app/utils/json-utils';

@Component({
    selector: 'app-admin-redirect',
    standalone: true,
    template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang điều hướng...</span>
      </div>
    </div>
  `
})
export class AdminRedirectComponent implements OnInit {

    permissions: UserPermission[] = [];

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        this.permissions = getLocal<UserPermission[]>('permissions', []);
        // Thứ tự ưu tiên trang đích tùy bạn quyết định
        if (this.hasPermission('ADMIN_NOTICE')) {
            this.router.navigate(['/admin/thongbao']);
        }
        else if (this.hasPermission('ADMIN_VOTE')) {
            this.router.navigate(['/admin/voting']);
        }
        else if (this.hasPermission('ADMIN_ERROR_LOG')) {
            this.router.navigate(['/admin/error-report']);
        }
        else if (this.hasPermission('ADMIN_GOPY')) {
            this.router.navigate(['/admin/gopy']);
        }
        else if (this.hasPermission('ADMIN_PERMISSION')) {
            this.router.navigate(['/admin/admin']);
        }
        else {
            // Nếu không có quyền cụ thể nào, về trang mặc định của Admin
            this.router.navigate(['/admin/forbidden']);
        }
    }

    hasPermission(code: string): boolean {
        return this.permissions.some(p => p.code === code);
    }

}