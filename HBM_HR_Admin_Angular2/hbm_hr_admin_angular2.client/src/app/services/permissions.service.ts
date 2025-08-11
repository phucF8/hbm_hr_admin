import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Permission {
  id: number;
  code: string;
  name: string;
  
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}/Permissions`);
  }

  // Lấy danh sách PermissionId của user
  getUserPermissions(userId: string) {
    return this.http.get<number[]>(`${this.baseUrl}/Permissions/user/${userId}`);
  }

  assignPermissions(userId: string, permissionIds: number[]): Observable<any> {
    const url = `${this.baseUrl}/Permissions/assign`;
    const body = {
      userId: userId,
      permissionIds: permissionIds
    };
    return this.http.post(url, body);
  }

}
