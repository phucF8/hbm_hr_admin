export interface NotificationType {
  id: number;
  name: string;
  description?: string;
}

export const NOTIFICATION_TYPES: NotificationType[] = [
  { id: 1, name: 'Hệ thống',description: 'do quản trị viên gửi đến toàn bộ người dùng'},
  { id: 2, name: 'Theo nhóm',description: 'do quản trị viên gửi đến một nhóm người dùng cụ thể'},
  { id: 3, name: 'Tự động',description:'hệ thống tự tạo khi có sự kiện xảy ra'}
];
