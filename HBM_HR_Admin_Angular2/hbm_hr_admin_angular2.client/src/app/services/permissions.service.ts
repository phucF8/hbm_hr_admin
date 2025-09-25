import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { showApiBusinessError, showApiError } from '@app/utils/error-handler';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private http: HttpClient,
  private toastr: ToastrService,
  ) {}

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

    return this.http.post<any>(url, body).pipe(
      map((res) => {
        // showJsonDebug(res)
        if (res.status === 'SUCCESS') {
          this.toastr.success('', res.message || 'Phân quyền thành công');
        } else {
          showApiBusinessError(res.message, 'Phân quyền thất bại');
        }
        return res;
      }),
      catchError((err: HttpErrorResponse) => {
        showApiError(err, 'Phân quyền thất bại');
        return throwError(() => err);
      })
    );

  }

}
