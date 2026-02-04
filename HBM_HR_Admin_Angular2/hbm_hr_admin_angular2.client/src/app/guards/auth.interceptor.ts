import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { showApiError, showJsonDebug } from '@app/utils/error-handler';
import Swal from 'sweetalert2';
import { AuthService } from '@app/services/auth.service';
import { environment } from 'environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
  ) { }

  /**gọi mỗi lần request api */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Nếu token còn hạn thì gắn Authorization Header
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    // Build minimal setHeaders so we don't overwrite headers already set by services
    const setHeaders: any = {};
    if (token) {
      setHeaders.Authorization = `Bearer ${token}`;
    }
    // If caller hasn't provided X-App-Token, set the default app token.
    // This preserves custom X-App-Token values set by specific services (e.g. DWH service).
    const hasXAppToken = request.headers.has('X-App-Token');
    if (!hasXAppToken) {
      setHeaders['X-App-Token'] = environment.appToken;
    }

    request = request.clone({ setHeaders });

    return next.handle(request).pipe(
      tap(() => {
        // có thể show success khi cần (nếu backend trả về status OK)
      }),
      // Kiểm tra lỗi 401 hoặc message từ backend
      catchError((error: HttpErrorResponse) => {
        // Skip redirect cho DWH API endpoints - để user có thể xử lý lỗi riêng
        const isDwhApi = request.url.includes('/dwh/');

        if (
          !isDwhApi &&
          (error.status === 401 ||
            error.error?.message?.includes('Không thể xác định danh tính'))
        ) {
          localStorage.removeItem('access_token');// Xóa token cũ
          sessionStorage.removeItem('access_token');
          this.dialog.closeAll();// Đóng tất cả dialog đang mở
          this.router.navigate(['login']);// Chuyển về trang login
        }
        return throwError(() => error);
      })
    );
  }


}
