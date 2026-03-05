/**
 * DTOs cho Event Management
 * Event là nội dung HTML hiển thị trên mobile app
 * Khớp với backend API: POST /api/event/...
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

// Request tạo event mới - khớp với CreateEventPageRequest backend
export interface CreateEventRequest {
  title: string;              // Tiêu đề event (max 255)
  htmlContent: string;        // Nội dung HTML
  isActive: boolean;          // Có hiển thị hay không
  version?: number;           // Phiên bản (mặc định 1)
  startTime: string | Date;   // Thời gian bắt đầu (ISO format)
  endTime?: string | Date;    // Thời gian kết thúc (ISO format)
  priority?: number;          // Độ ưu tiên (mặc định 0)
}

// Request cập nhật event - khớp với UpdateEventPageRequest backend
export interface UpdateEventRequest {
  id: string;                 // Event ID (GUID)
  title: string;              // Tiêu đề event
  htmlContent: string;        // Nội dung HTML
  isActive: boolean;
  version?: number;
  startTime: string | Date;   // Thời gian bắt đầu
  endTime?: string | Date;
  priority?: number;
}

// Event item trong danh sách - khớp với EventPage backend model
export interface EventItem {
  id: string;                 // GUID
  title: string;
  content: string;            // HTML content để render (alias cho htmlContent)
  htmlContent?: string;       // Backward compatibility
  isActive: boolean;
  version?: number;
  startDate: string | Date | null;    // Thời gian bắt đầu (alias cho startTime)
  endDate?: string | Date | null;     // Thời gian kết thúc (alias cho endTime)
  startTime?: string | Date | null;   // Backward compatibility
  endTime?: string | Date | null;     // Backward compatibility
  priority?: number;
  orderNumber?: number;       // Thứ tự hiển thị
  selected?: boolean;         // UI only - dùng cho checkbox select multiple
  imageUrl?: string;          // Optional image URL
}

// Response cho danh sách events với phân trang
export interface EventResponse {
  status: string;
  message: string;
  data: {
    items: EventItem[];
    totalPages: number;
    totalCount?: number;
    currentPage?: number;
  };
}

export interface EventDetailResponse {
  status: string;
  message: string;
  data: EventItem;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

