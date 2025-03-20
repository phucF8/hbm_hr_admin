import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ThongBao {
  id: string;
  title: string;
  content: string;
  senderId: string;
  tenNhanVien: string;
  triggerAction?: string;
  notificationType: number;
  status: number;
  sentAt?: Date;
  ngayTao: Date;
  ngaySua: Date;
  nguoiTao: string;
  nguoiSua: string;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThongBaoService {
  private apiUrl = 'https://localhost:7046/api/thongbao';

  constructor(private http: HttpClient) {}

  getThongBao(): Observable<ThongBao[]> {
    return this.http.get<ThongBao[]>(this.apiUrl);
  }
}
