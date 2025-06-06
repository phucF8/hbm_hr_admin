import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Root } from '@app/responses/thongbao_rp';
import { Observable, catchError } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ErrorReportService {

  private apiUrl = `${environment.apiUrl}/thongbao`;  // Lấy apiUrl từ environment

  constructor(private http: HttpClient) { }

  getList(
    pageIndex: number = 1,
    sortBy: string = 'ngayTao',
    searchText: string = '',
    ngayTaoTu?: string,
    ngayTaoDen?: string,
    ngayGuiTu?: string,
    ngayGuiDen?: string,
    trangThai?: number | null, // null: tất cả, 1: đã gửi, 0: chưa gửi
    notificationType?: number | null, // null: tất cả, 1: tự động, 2: chủ động 
    isSentToAll?: number | null, // null: tất cả, 1: đã hoàn thành, 2: chưa hoàn thành
    loaiThongBao?: string | null,  //vd:loaiThongBao?: string | null  //vd: RQ,GT, ...
    isPlatform?: string | null, // null: tất cả, MB: mobile, WEB: web
    ngTaoIds?: string[], // ← thêm vào đây
    ngNhanIds?: string[],
  ): Observable<Root> {
    let params = new HttpParams()
    if (pageIndex){
      console.log('Page Index:', pageIndex);
      params = params.set('pageIndex', pageIndex);
    } 
        
    if (sortBy) 
      params = params.set('sortBy', sortBy);
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
    if (notificationType !== null && notificationType !== undefined) 
      params = params.set('notificationType', notificationType.toString());
    if (isSentToAll !== null && isSentToAll !== undefined) 
      params = params.set('isSentToAll', isSentToAll.toString());
    if (loaiThongBao) 
      params = params.set('loaiThongBao', loaiThongBao);
    if (ngTaoIds && ngTaoIds.length > 0)
      params = params.set('ngTaoIds', ngTaoIds.join(',')); // ← nối mảng thành chuỗi
    if (ngNhanIds && ngNhanIds.length > 0)
      params = params.set('ngNhanIds', ngNhanIds.join(',')); // ← nối mảng thành chuỗi
    if (searchText) 
      params = params.set('searchText', searchText);
    if (isPlatform) 
      params = params.set('platform', isPlatform);
    
    // DebugUtils.openStringInNewWindow(`${this.apiUrl}?${params.toString()}`);

    return this.http.get<Root>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }


  
  delete(id: string): Observable<void> {
    console.log('Deleting notification:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting notification:', error);
        throw error;
      })
    );
  }


}
