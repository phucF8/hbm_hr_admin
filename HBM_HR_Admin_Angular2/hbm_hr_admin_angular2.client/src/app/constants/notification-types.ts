export interface NotificationType {
  id: number;
  name: string;
}
export const NOTIFICATION_TYPES: NotificationType[] = [
  { id: 1, name: 'Thông báo hệ thống'},// (do quản trị viên gửi đến toàn bộ người dùng)
  { id: 2, name: 'Thông báo nhóm' },// (do quản trị viên gửi đến một nhóm người dùng cụ thể)
  { id: 3, name: 'Thông báo tự động' }// (hệ thống tự tạo khi có sự kiện xảy ra)
];
