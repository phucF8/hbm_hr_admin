import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  getThongBao(notificationType: number = 0): Observable<ThongBao[]> {
    const url = `${this.apiUrl}?notificationType=${notificationType}`;
    console.log('Calling API:', url);
    return this.http.get<ThongBao[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }
}
