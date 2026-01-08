export interface GopYRequest {
  pageNumber: number;
  pageSize: number;
  search: string;
  trangThai: string;
  filterType: string;
}

export interface GopYItem {
  id: string;
  tieuDe: string;
  nhanVienID: string;
  noiDung: string;
  ngayGui: string;
  trangThai: string;
  maTraCuu: string;
  anDanh: boolean;
  tenNguoiGui: string;
  anhNguoiGui: string;
  tenNguoiNhan: string;
  // ... các field khác nếu cần
}

export interface GopYResponse {
  status: string;
  message: string;
  data: {
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    items: GopYItem[];
  };
}