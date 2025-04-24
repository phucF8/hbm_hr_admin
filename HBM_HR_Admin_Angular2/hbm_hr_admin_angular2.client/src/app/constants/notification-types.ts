export interface NotificationType {
  id: number;
  name: string;
  description?: string;
}

export const NOTIFICATION_TYPES: NotificationType[] = [
  { id: 1, name: 'Tự động',description: 'hệ thống tự tạo khi có sự kiện xảy ra'},
  { id: 2, name: 'Chủ động',description: 'do quản trị viên gửi đến một nhóm người dùng cụ thể'},
];
