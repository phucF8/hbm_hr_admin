/**
 * DTOs cho Event Management
 * Event là nội dung HTML hiển thị trên mobile app
 */

// Request để lấy danh sách events (có phân trang và filter)
export interface EventRequest {
  pageNumber: number;
  pageSize: number;
  search: string;
  status?: string;      // 'true' | 'false' | '' (tất cả)
  fromDate?: string;    // Filter theo ngày bắt đầu
  toDate?: string;      // Filter theo ngày kết thúc
}

// Request tạo event mới
export interface CreateEventRequest {
  title: string;        // Tiêu đề event
  content: string;      // Nội dung HTML
  imageUrl?: string;    // URL ảnh thumbnail
  startDate?: string;
  endDate?: string;
  isActive: boolean;    // Có hiển thị trên mobile không
  orderNumber?: number; // Thứ tự ưu tiên (càng nhỏ càng trước)
}

// Request cập nhật event
export interface UpdateEventRequest {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  orderNumber?: number;
}

// Event item trong danh sách
export interface EventItem {
  id: string;
  title: string;
  content: string;           // HTML content để render trên mobile
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  orderNumber?: number;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  selected?: boolean;        // Dùng cho checkbox select multiple (UI only)
}

export interface EventResponse {
  status: string;
  message: string;
  data: {
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: EventItem[];
  };
}

export interface EventDetailResponse {
  status: string;
  message: string;
  data: EventItem;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
