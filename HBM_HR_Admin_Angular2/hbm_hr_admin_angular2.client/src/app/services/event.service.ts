import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  EventRequest, 
  EventResponse, 
  EventDetailResponse, 
  CreateEventRequest, 
  UpdateEventRequest,
  ApiResponse,
  EventItem
} from '@app/models/event.model';
import { environment } from 'environments/environment';

/**
 * Service quản lý Event HTML hiển thị trên mobile app
 * Cung cấp các phương thức CRUD và quản lý trạng thái event
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = `${environment.apiUrl}/Event`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách events với phân trang và filter
   * Sử dụng POST để gửi các tham số tìm kiếm phức tạp
   */
  getAllEvents(request: EventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.apiUrl}/GetAll`, request);
  }

  /** Lấy chi tiết 1 event theo ID */
  getEventById(id: string): Observable<EventDetailResponse> {
    return this.http.get<EventDetailResponse>(`${this.apiUrl}/${id}`);
  }

  /** Tạo event HTML mới để hiển thị trên mobile */
  createEvent(request: CreateEventRequest): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/Create`, request);
  }

  /** Cập nhật thông tin event */
  updateEvent(request: UpdateEventRequest): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/Update`, request);
  }

  /** Xóa 1 event */
  deleteEvent(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  /** Xóa nhiều events cùng lúc */
  deleteMultipleEvents(ids: string[]): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/DeleteMultiple`, ids, { headers });
  }

  /** Bật/tắt hiển thị event trên mobile app */
  toggleEventStatus(id: string, isActive: boolean): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ToggleStatus`, { id, isActive });
  }
}
