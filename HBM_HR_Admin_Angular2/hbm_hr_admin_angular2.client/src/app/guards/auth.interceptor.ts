import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    //const token = localStorage.getItem('accessToken'); // hoặc sessionStorage
    const token = "a7f2b9c8e5d14faea1431bd245c6f3cd98e2f7b34c617d8a4c82d6f57af9e319";
    if (token) {
      // Gắn header Authorization: Bearer <token>
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
