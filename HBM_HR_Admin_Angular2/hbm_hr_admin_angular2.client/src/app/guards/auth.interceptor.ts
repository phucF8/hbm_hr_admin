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
    let headers: any = { 'X-App-Token': environment.appToken };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    request = request.clone({ setHeaders: headers });

    return next.handle(request).pipe(
      tap(() => {
        // có thể show success khi cần (nếu backend trả về status OK)
      }),
      // Kiểm tra lỗi 401 hoặc message từ backend
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 ||
          error.error?.message?.includes('Không thể xác định danh tính')
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
