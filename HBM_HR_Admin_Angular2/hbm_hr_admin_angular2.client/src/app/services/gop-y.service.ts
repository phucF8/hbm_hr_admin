import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GopYRequest, GopYResponse } from '@app/models/gopy.model';
import { environment } from 'environments/environment';
import { ApiResponseGopY } from '@app/models/gopy_chitiet.model';

@Injectable({
  providedIn: 'root'
})
export class GopYService {

  constructor(private http: HttpClient) {}

  getAllGopYs(request: GopYRequest): Observable<GopYResponse> {
    const apiUrl = `${environment.apiUrl}/GopY/GetAllGopYs`;
    return this.http.post<GopYResponse>(apiUrl, request);
  }

  getChiTietGopY(id: string): Observable<ApiResponseGopY> {
    const url = `${environment.apiUrl}/GopY/admin/chitiet`;
    const request = { id: id }; // Đúng cấu trúc JSON request bạn yêu cầu
    return this.http.post<ApiResponseGopY>(url, request);
  }

}