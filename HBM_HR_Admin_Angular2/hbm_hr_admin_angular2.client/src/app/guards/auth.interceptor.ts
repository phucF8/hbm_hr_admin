import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lấy token từ localStorage hoặc sessionStorage
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Kiểm tra lỗi 401 hoặc message từ backend
        if (
          error.status === 401 ||
          error.error?.message?.includes('Không thể xác định danh tính')
        ) {
          localStorage.removeItem('access_token');// Xóa token cũ
          sessionStorage.removeItem('access_token');
          this.router.navigate(['login']);// Chuyển về trang login
        }
        return throwError(() => error);
      })
    );
  }


}
