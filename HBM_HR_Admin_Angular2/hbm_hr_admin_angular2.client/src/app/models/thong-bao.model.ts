export interface ThongBaoRecipient {
  notificationId: string;
  recipientId: string;
  tenNhanVien: string;
  status: number;
}

export interface ThongBao {
  id: string;
  title: string;
  content: string;
  senderId: string;
  tenNhanVien: string;
  notificationType: number;
  status: number;
  sentAt?: string | null;
  receivedCount: number;
  totalRecipients: number;
  ngayTao: string;
  recipients: ThongBaoRecipient[];  // Danh sách người nhận
  selected?: boolean;
}