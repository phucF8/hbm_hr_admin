import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_CONSTANTS } from '../constants/api.constants';

export interface NhanVienInfo {
  Username: string;
  Password: string;
}

export interface LoginRequest {
  AccessToken: string;
  NhanVienInfo: NhanVienInfo;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_CONSTANTS.LOGIN_BASE_URL;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Kiểm tra token trong localStorage khi khởi tạo service
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = {
      AccessToken: API_CONSTANTS.ACCESS_TOKEN,
      NhanVienInfo: {
        Username: username,
        Password: password
      }
    };
    console.log('Login attempt:', { username, password });
    return this.http.post<LoginResponse>(`${this.apiUrl}/DoCheckLogin`, request).pipe(
      tap(response => {
        // Lưu thông tin user và token vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    // Xóa thông tin user và token khỏi localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }
} 