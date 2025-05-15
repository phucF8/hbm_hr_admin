export interface ThongBaoRecipient {
  notificationId: string;
  recipientId: string;
  tenNhanVien: string;
  tenChucDanh: string;
  tenPhongBan: string;
  status: number;
  ngayTao: string;
}

export interface ThongBao {
  id: string;
  title: string;
  content: string;
  senderId: string;
  tenNhanVien: string;
  notificationType: number;
  loaiThongBao: string;
  idThamChieu: string;
  status: number;
  platform: string;
  receivedCount: number;
  totalRecipients: number;
  ngayTao: string;
  recipients: ThongBaoRecipient[];  // Danh sách người nhận
  selected?: boolean;
}

export interface MergedData {
  ID: string;          // ID từ DoLookupData
  MaNhanVien: string;  // Mã nhân viên từ DoLookupData
  TenNhanVien: string; // Tên nhân viên từ DoLookupData
  TenPhongBan: string; // Phòng ban từ DoLookupData
  TenChucDanh: string; // Chức danh từ DoLookupData
  Anh: string;        // Ảnh từ DoLookupData
  status: number | null; // Trạng thái thông báo từ ThongBaoRecipient
  ngayTao: string;
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