import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
 * APIs khớp với backend EventController:
 * - POST /api/event/active - Lấy event đang hoạt động
 * - POST /api/event/GetAll - Lấy tất cả events
 * - POST /api/event/GetById - Lấy event theo ID
 * - POST /api/event/create - Tạo event mới
 * - POST /api/event/update - Cập nhật event
 * - POST /api/event/delete - Xóa event
 * - POST /api/event/toggle - Toggle trạng thái IsActive
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = `${environment.apiUrl}/event`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy event đang active theo thời gian
   * POST /api/event/active
   */
  getActiveEvent(): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/active`, {});
  }

  /**
   * Lấy tất cả events (có thể kèm filter)
   * POST /api/event/GetAll
   */
  getAllEvents(request?: EventRequest): Observable<ApiResponse<EventItem[]>> {
    return this.http.post<ApiResponse<EventItem[]>>(`${this.apiUrl}/GetAll`, request || {});
  }

  /**
   * Lấy chi tiết 1 event theo ID
   * POST /api/event/GetById
   */
  getEventById(id: string): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/GetById`, { id });
  }

  /**
   * Tạo event HTML mới để hiển thị trên mobile
   * POST /api/event/create
   */
  createEvent(request: CreateEventRequest): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/create`, request);
  }

  /**
   * Cập nhật thông tin event
   * POST /api/event/update
   */
  updateEvent(request: UpdateEventRequest): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/update`, request);
  }

  /**
   * Xóa 1 event
   * POST /api/event/delete
   */
  deleteEvent(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/delete`, { id });
  }

  /**
   * Bật/tắt trạng thái IsActive của event
   * POST /api/event/toggle
   */
  toggleEventStatus(id: string): Observable<ApiResponse<EventItem>> {
    return this.http.post<ApiResponse<EventItem>>(`${this.apiUrl}/toggle`, { id });
  }

  /**
   * Generate HTML từ HtmlContent JSON (cho live preview)
   * POST /api/event/preview
   */
  generatePreviewHtml(htmlContent: string): Observable<ApiResponse<{ html: string }>> {
    return this.http.post<ApiResponse<{ html: string }>>(`${this.apiUrl}/preview`, { htmlContent });
  }
}

