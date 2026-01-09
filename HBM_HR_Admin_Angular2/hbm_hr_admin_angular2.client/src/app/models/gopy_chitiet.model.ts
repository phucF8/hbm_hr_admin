export interface ChiTietGopY {
  id: string;
  tieuDe: string;
  noiDung: string;
  nhanVienId: string;
  anDanh: boolean;
  createdDate: string;
  files: any[]; // Thay any bằng interface file nếu có
  groupID: string | null;
  tenNguoiGui: string;
  anhNguoiGui: string | null;
  tenChucDanhNguoiGui: string | null;
  tenNguoiNhan: string;
  anhNguoiNhan: string | null;
  tenChucDanhNguoiNhan: string;
}

export interface ApiResponseGopY {
  status: string;
  message: string;
  data: ChiTietGopY;
}