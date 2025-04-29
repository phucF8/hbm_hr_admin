import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { API_CONSTANTS } from '../constants/api.constants';
import { DebugUtils } from '@app/utils/debug-utils';

export interface NhanVienInfo {
  Username: string;
  Password: string;
}

export interface LoginRequest {
  AccessToken: string;
  NhanVienInfo: NhanVienInfo;
}

export interface UserInfo {
  ID: string;
  MaNhanVien: string;
  TenNhanVien: string;
  Username: string;
  UserID: string;
  TenPhongBan: string;
  TenChucVu: string;
  TenBoPhan: string;
  TenDonVi: string;
  DiDong: string;
  MaPhongBan: string;
  Anh: string;
}

export interface LoginResponse {
  Status: string;
  Message: string;
  DataSets: {
    Table: UserInfo[];
    Table1: Array<{
      ID: string;
      ModuleID: string;
      FunctionID: string;
      Code: string;
      Name: string;
    }>;
    Table2: Array<{
      ID: string;
      Code: string;
      Title: string;
      Url: string;
      IconUrl: string;
      ParentId: string;
    }>;
    Table3: Array<{
      ID: string;
      TenKho: string;
      Ma: string;
      DiaChi: string;
      Email: string;
      DienThoai: string;
    }>;
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
    DebugUtils.openStringInNewWindow(JSON.stringify(request, null, 2));
    return this.http.post<LoginResponse>(`${this.apiUrl}/DoCheckLogin`, request).pipe(
      tap(response => {
        if (response.Status === 'SUCCESS') {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
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

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value?.DataSets.Table[0] || null;
  }

  getUserPermissions(): Array<{Code: string, Name: string}> {
    return this.currentUserSubject.value?.DataSets.Table1 || [];
  }

  getUserMenus(): Array<{ID: string, Code: string, Title: string, Url: string, IconUrl: string, ParentId: string}> {
    return this.currentUserSubject.value?.DataSets.Table2 || [];
  }

  getUserLocation(): {TenKho: string, Ma: string, DiaChi: string, Email: string, DienThoai: string} | null {
    return this.currentUserSubject.value?.DataSets.Table3[0] || null;
  }
} 