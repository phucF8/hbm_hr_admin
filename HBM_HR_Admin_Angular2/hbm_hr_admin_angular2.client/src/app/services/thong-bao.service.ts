import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { ThongBao } from '../models/thong-bao.model'; // Import the ThongBao interface
import { environment } from '../../environments/environment'; 
import { DebugUtils } from '@app/utils/debug-utils';


export interface MergedData {
  ID: string;          // ID từ DoLookupData
  MaNhanVien: string;  // Mã nhân viên từ DoLookupData
  TenNhanVien: string; // Tên nhân viên từ DoLookupData
  TenPhongBan: string; // Phòng ban từ DoLookupData
  status: number | null; // Trạng thái thông báo từ ThongBaoRecipient
}

export interface DoLookupData {
  ID: string;
  MaNhanVien: string;
  TenNhanVien: string;
  UserID: string;
  TenPhongBan: string;
  TenChucDanh: string;
  Anh: string;
  DonViRoot: string;
  DiDong: string;
}

export interface DoLookupDatasRP {
  Status: string;
  DatasLookup: DoLookupData[];
}



export interface ThongBaoRecipient {
  notificationId: string;
  recipientId: string;
  tenNhanVien: string;
  status: number;
}

export interface TestSendNotificationRequest {
  NotificationID: string; // ID thông báo
  IDNhanViens: string;  // Chuỗi chứa các ID nhân viên, cách nhau bởi dấu ","
  Title: string;        // Tiêu đề thông báo
  Body: string;         // Nội dung thông báo
  Data: { [key: string]: string };  // Dữ liệu bổ sung nếu cần

}


interface UserStat {
  userId: string;
  success: number;
  totalTokens: number;
  status: string;
}

interface NotificationResponse {
  message: string;
  successCount: number;
  totalCount: number;
  successRate: number;
  userStats: UserStat[];
}


export interface CreateThongBaoRequest {
  id: string;
  title: string;
  content: string;
  notificationType: number;
  senderId: string;
  sentAt?: Date;
  recipients: string[]; // Danh sách ID người nhận
}


export interface UpdateThongBaoRequest extends CreateThongBaoRequest {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThongBaoService {

  private apiUrl = `${environment.apiUrl}/thongbao`;  // Lấy apiUrl từ environment
  
  constructor(private http: HttpClient) { }
  
  getListThongBao(
    pageIndex: number = 1,
    sortBy: string = 'ngayTao',
    searchText: string = '',
    ngayTaoTu?: string,
    ngayTaoDen?: string,
    ngayGuiTu?: string,
    ngayGuiDen?: string,
    trangThai?: number | null, // null: tất cả, 1: đã gửi, 0: chưa gửi
    loaiThongBao?: number | null // null: tất cả, 1: tự động, 2: chủ động 
  ): Observable<{ items: ThongBao[], totalCount: number }> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('sortBy', sortBy)
      .set('searchText', searchText);
    if (ngayTaoTu) 
      params = params.set('ngayTaoTu', ngayTaoTu);
    if (ngayTaoDen) 
      params = params.set('ngayTaoDen', ngayTaoDen);
    if (ngayGuiTu)
      params = params.set('ngayGuiTu', ngayGuiTu);
    if (ngayGuiDen)
      params = params.set('ngayGuiDen', ngayGuiDen);
    if (trangThai !== null && trangThai !== undefined) 
      params = params.set('trangThai', trangThai.toString());
    if (loaiThongBao !== null && loaiThongBao !== undefined) 
      params = params.set('notificationType', loaiThongBao.toString());


    DebugUtils.openStringInNewWindow(`${this.apiUrl}?${params.toString()}`);


    return this.http.get<{ items: ThongBao[], totalCount: number }>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }
  
  
  getThongBaoByID(notificationID: string): Observable<ThongBao> {
    const url = `${this.apiUrl}/${notificationID}`;
    console.log('Calling API:', url);
    return this.http.get<ThongBao>(url).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  searchUsers(keyword: string): Observable<DoLookupDatasRP> {
    const url = `https://apihr.hbm.vn:9004/api/hr/employee/DoLookupDatas`;
    const requestBody = {
      AccessToken: "eaf0789cc663860acbf99017282eab25",
      NhanVienInfo: {
        ID: "38a65e3488e8438e",
        UserID: "a45bc90fea154dba",
        Username: "vietdt@hbm.vn",
        IDKhoLamViec: "08a8f3bec5934"
      },
      DLChamCongCondition: {
        Loai: "RQ_NV",
        TuKhoa: keyword,
        KhoDuLieu: "08a8f3bec5934"
      }
    };

    console.log('Searching users:', url, requestBody);
    
    return this.http.post<DoLookupDatasRP>(url, requestBody).pipe(
      catchError(error => {
        console.error('Error searching users:', error);
        throw error;
      })
    );
  }

  createThongBao(request: CreateThongBaoRequest): Observable<ThongBao> {
    console.log('Creating new notification:', request);
    return this.http.post<ThongBao>(this.apiUrl, request).pipe(
      catchError(error => {
        console.error('Error creating notification:', error);
        throw error;
      })
    );
  }

  deleteThongBao(id: string): Observable<void> {
    console.log('Deleting notification:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting notification:', error);
        throw error;
      })
    );
  }

  deleteMultiThongBao(notificationIds: string[]): Observable<void> {
    console.log('Deleting multiple notifications:', notificationIds);
    return this.http.delete<void>(`${this.apiUrl}/multi`, { 
      body: JSON.stringify(notificationIds), // Chuyển đổi sang JSON
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(error => {
        console.error('Error deleting multiple notifications:', error);
        throw error;
      })
    );
  }

  updateThongBao(request: UpdateThongBaoRequest): Observable<ThongBao> {
    console.log('Updating notification:', request);
    return this.http.put<ThongBao>(`${this.apiUrl}/${request.id}`, request).pipe(
      catchError(error => {
        console.error('Error updating notification:', error);
        throw error;
      })
    );
  }

  sendThongBao(request: TestSendNotificationRequest): Observable<NotificationResponse> {
    const url = `${this.apiUrl}/send`;
    console.log('Sending notification:', request);
    return this.http.post<NotificationResponse>(url, request).pipe(
      catchError(error => {
        console.error('Error sending notification:', error);
        throw error;
      })
    );
  }
}
