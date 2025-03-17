import { Component } from '@angular/core';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  standalone: false,
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent {
  notifications = [
    'Thông báo 1: Cập nhật hệ thống',
    'Thông báo 2: Lịch họp ngày mai',
    'Thông báo 3: Đăng ký khóa đào tạo'
  ];
}
