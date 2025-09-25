import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { API_CONSTANTS } from '../constants/api.constants';
import { DebugUtils } from '@app/utils/debug-utils';

import { Observable, BehaviorSubject, tap } from 'rxjs';
import { of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { showApiError, showJsonDebug } from '@app/utils/error-handler';
import { setLocal } from '@app/utils/json-utils';

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
  IDKhoLamViec: string;
}

export interface UserPermission {
  ID: string;
  ModuleID: string;
  FunctionID: string;
  Code: string;
  Name: string;
}

export interface LoginAdminResponse {
  status: string
  token: string
  username: string
  message: string
}

// export interface LoginResponse {
//   Status: string;
//   Message: string;
//   DataSets: {
//     Table: UserInfo[];
//     Table1: UserPermission[];
//     Table2: Array<{
//       ID: string;
//       Code: string;
//       Title: string;
//       Url: string;
//       IconUrl: string;
//       ParentId: string;
//     }>;
//     Table3: Array<{
//       ID: string;
//       TenKho: string;
//       Ma: string;
//       DiaChi: string;
//       Email: string;
//       DienThoai: string;
//     }>;
//   };
// }

export interface NhanVien {
  id: string;
  idPhongBan: string;
  idKhoLamViec: string;
  idChucVu: number;
  hinhThucLamViec: string;
  ngayHoSo: string; // ISO date string
  maNhanVien: string;
  tenNhanVien: string;
  username: string;
  userID: string;
  tenPhongBan: string;
  tenChucVu: string;
  idBoPhan: string;
  idChucDanh: number;
  tenChucDanh: string;
  anh: string;
  tenBoPhan: string;
  tenDonVi: string;
  diDong: string;
  maPhongBan: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  permissions: number[];   // thay role bằng mảng quyền
  expiresIn: number;
  message?: string; // Có thể null nếu login thành công
  nhanVien: NhanVien;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'access_token';

  constructor(private http: HttpClient) {

  }

  login(username: string, password: string): Observable<LoginResponse> {
    const body = { username, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, body)
      .pipe(
        tap(res => {
          showJsonDebug(res);
          if (res && res.token) {
            // Lưu token và thông tin cơ bản
            localStorage.setItem('access_token', res.token);
            localStorage.setItem('username', res.username);
            localStorage.setItem('permissions', JSON.stringify(res.permissions));
            setLocal('permissions',res.permissions);
            // Lưu thông tin nhân viên đầy đủ cho UserInfo
            if (res.nhanVien) {
              localStorage.setItem('id', res.nhanVien.id || '');
              localStorage.setItem('maNhanVien', res.nhanVien.maNhanVien || '');
              localStorage.setItem('tenNhanVien', res.nhanVien.tenNhanVien || '');
              localStorage.setItem('userID', res.nhanVien.userID || '');
              localStorage.setItem('tenPhongBan', res.nhanVien.tenPhongBan || '');
              localStorage.setItem('tenChucVu', res.nhanVien.tenChucVu || '');
              localStorage.setItem('tenBoPhan', res.nhanVien.tenBoPhan || '');
              localStorage.setItem('tenDonVi', res.nhanVien.tenDonVi || '');
              localStorage.setItem('diDong', res.nhanVien.diDong || '');
              localStorage.setItem('maPhongBan', res.nhanVien.maPhongBan || '');
              localStorage.setItem('anh', res.nhanVien.anh || '');

              localStorage.setItem('idKhoLamViec', res.nhanVien.idKhoLamViec || '');

            }
          }
        }),
        catchError((err: HttpErrorResponse) => {
        showApiError(err, 'Đăng nhập thất bại');
        return throwError(() => err);
      })
      );
  }


  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

   removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // login0(username: string, password: string): Observable<LoginResponse> {
  //   const request: LoginRequest = {
  //     AccessToken: API_CONSTANTS.ACCESS_TOKEN,
  //     NhanVienInfo: {
  //       Username: username,
  //       Password: password
  //     }
  //   };

  //   return this.http.post<LoginResponse>(`${API_CONSTANTS.LOGIN_BASE_URL}/DoCheckLogin`, request).pipe(
  //     switchMap(response => {
  //       if (response.Status === 'SUCCESS') {
  //         return this.http.post<LoginAdminResponse>(`${API_CONSTANTS.AUTH_URL}/login`, {Username: 'admin',password:'123456'}).pipe(// Gọi API từ server khác tại đây, ví dụ:
  //           tap(secondResponse => {
  //             if (secondResponse.status === 'SUCCESS') {
  //               localStorage.setItem('currentUser', JSON.stringify(response));
  //               localStorage.setItem('accessToken', secondResponse.token);
  //               this.currentUserSubject.next(response);
  //             } else {
  //               throw new Error(secondResponse.message || 'Login failed');
  //             }
  //           }),
  //           switchMap(() => of(response)) // Đảm bảo trả về `response` để không làm hỏng kiểu trả về của Observable
  //         );
  //       } else {
  //         return throwError(() => new Error(response.Message));
  //       }
  //     }),
  //     catchError(error => {
  //       console.error('Login failed:', error);
  //       return throwError(() => error);
  //     })
  //   );
  // }


  logout(): void {
    localStorage.clear();// Xóa toàn bộ dữ liệu trong localStorage
    sessionStorage.clear();// Xóa toàn bộ dữ liệu trong sessionStorage (nếu có dùng)
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return token !== null && token.trim() !== '';
  }


  getCurrentUser(): UserInfo | null {
    const id = localStorage.getItem('id');
    if (!id) {
      return null; // Nếu chưa lưu thông tin user thì trả null
    }

    return {
      ID: id,
      MaNhanVien: localStorage.getItem('maNhanVien') || '',
      TenNhanVien: localStorage.getItem('tenNhanVien') || '',
      Username: localStorage.getItem('username') || '',
      UserID: localStorage.getItem('userID') || '',
      TenPhongBan: localStorage.getItem('tenPhongBan') || '',
      TenChucVu: localStorage.getItem('tenChucVu') || '',
      TenBoPhan: localStorage.getItem('tenBoPhan') || '',
      TenDonVi: localStorage.getItem('tenDonVi') || '',
      DiDong: localStorage.getItem('diDong') || '',
      MaPhongBan: localStorage.getItem('maPhongBan') || '',
      Anh: localStorage.getItem('anh') || '',
      IDKhoLamViec: localStorage.getItem('idKhoLamViec') || '',
    };
  }


  getUserPermissions(): Array<{ Code: string, Name: string }> {
    return [];
  }

  getUserMenus(): Array<{ ID: string, Code: string, Title: string, Url: string, IconUrl: string, ParentId: string }> {
    return [];
  }

  getUserLocation(): { TenKho: string, Ma: string, DiaChi: string, Email: string, DienThoai: string } | null {
    return null;
  }
} 