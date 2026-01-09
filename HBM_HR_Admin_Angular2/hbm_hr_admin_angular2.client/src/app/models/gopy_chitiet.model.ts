export interface FileGopY {
  fileName: string;
  fileUrl: string;
}

export interface ChiTietGopY {
  id: string;
  tieuDe: string;
  noiDung: string;
  nhanVienId: string;
  anDanh: boolean;
  createdDate: string;
  files: FileGopY[]; // Đã cập nhật từ any[] sang FileGopY[]
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