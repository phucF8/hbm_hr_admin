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
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW4iLCJleHAiOjE3NDg2ODAyMzUsImlzcyI6Imh0dHBzOi8vYWRtaW4uaGJtLnZuIiwiYXVkIjoiaGJtLW1vYmlsZS1hcHAifQ.oWIWxwPVkQIJfR7s-wZgRfGvUTaXtcixe3KbTuRxFS8";
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
