export interface ThongBaoRecipient {
  notificationId: string;
  recipientId: string;
  tenNhanVien: string;
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
  status: number;
  receivedCount: number;
  totalRecipients: number;
  ngayTao: string;
  recipients: ThongBaoRecipient[];  // Danh sách người nhận
  selected?: boolean;
}