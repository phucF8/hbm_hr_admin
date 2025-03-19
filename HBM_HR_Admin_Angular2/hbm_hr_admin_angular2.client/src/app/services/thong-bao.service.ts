import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string;
  ngayTao: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThongBaoService {
  private apiUrl = 'https://localhost:7046/api/thongbao'; // Đổi cổng nếu cần

  constructor(private http: HttpClient) {}

  getThongBao(): Observable<ThongBao[]> {
    return this.http.get<ThongBao[]>(this.apiUrl);
  }
}
