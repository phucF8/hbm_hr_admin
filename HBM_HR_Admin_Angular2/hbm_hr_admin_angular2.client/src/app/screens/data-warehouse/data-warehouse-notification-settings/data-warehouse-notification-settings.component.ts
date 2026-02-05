import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SearchUserFormComponent } from '@app/uicomponents/search-user-form/search-user-form.component';
import { DataWarehouseService } from '../services/data-warehouse.service';
import Swal from 'sweetalert2';

interface UserNotificationSetting {
  id: string;
  name: string;
  email: string;
  receiveErrors: boolean;
}

@Component({
  selector: 'app-data-warehouse-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchUserFormComponent],
  templateUrl: './data-warehouse-notification-settings.component.html',
  styleUrls: ['./data-warehouse-notification-settings.component.css']
})
export class DataWarehouseNotificationSettingsComponent implements OnInit {
  
  @ViewChild(SearchUserFormComponent) searchUserComp!: SearchUserFormComponent;
  
  users: UserNotificationSetting[] = [];
  searchText: string = '';

  get filteredUsers(): UserNotificationSetting[] {
    const q = this.searchText?.toLowerCase()?.trim();
    if (!q) return this.users;
    return this.users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }

  constructor(
    public dialogRef: MatDialogRef<DataWarehouseNotificationSettingsComponent>,
    private dataWarehouseService: DataWarehouseService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.dataWarehouseService.getNotificationRecipientsList()
      .subscribe({
        next: (recipients) => {
          console.log('Loaded notification recipients:', recipients);
          // Map API response để truyền vào SearchUserFormComponent
          const selectedUsers = recipients.map((r: any) => ({
            ID: r.idUser || r.id,
            MaNhanVien: r.maNhanVien,
            Anh: r.anh?.startsWith('http') ? r.anh : `https://workhub.hbm.vn${r.anh}`,
            TenNhanVien: r.tenNhanVien,
            TenPhongBan: r.tenPhongBan,
            TenChucDanh: r.tenChucDanh,
            status: 0
          }));
          
          if (this.searchUserComp) {
            this.searchUserComp.setSelectedUsers(selectedUsers);
          }
        },
        error: (error) => {
          console.error('Error loading notification recipients:', error);
          const errorMessage = this.getErrorMessage(error, 'POST /dwh/notification/recipients/list');
          Swal.fire({
            icon: 'error',
            title: 'Lỗi tải danh sách',
            html: errorMessage,
            confirmButtonText: 'Đóng'
          });
        }
      });
  }

  toggleNotification(user: UserNotificationSetting): void {
    user.receiveErrors = !user.receiveErrors;
  }

  // Unselect / remove from recipients (keeps user in list but disables notification)
  removeRecipient(user: UserNotificationSetting): void {
    user.receiveErrors = false;
  }

  // Accept selected users emitted by app-search-user-form
  // SearchUserFormComponent tự quản lý danh sách, không cần xử lý thêm
  onSelectedUsersChange(selectedUsers: any[]) {
    console.log('Selected users changed:', selectedUsers);
  }

  saveSettings(): void {
    // Lấy danh sách users từ SearchUserFormComponent
    const selectedUsers = this.searchUserComp?.getSelected() || [];
    const userIds = selectedUsers.map((u: any) => u.ID);

    this.dataWarehouseService.assignNotificationRecipients(userIds)
      .subscribe({
        next: (result) => {
          console.log('Notification settings saved successfully:', result);
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã lưu cấu hình thông báo',
            timer: 2000,
            showConfirmButton: false
          });
          this.dialogRef.close(selectedUsers);
        },
        error: (error) => {
          console.error('Error saving notification settings:', error);
          const errorMessage = this.getErrorMessage(error, 'POST /dwh/etl/job-log/recipients', userIds);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi lưu cấu hình',
            html: errorMessage,
            confirmButtonText: 'Đóng'
          });
        }
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Helper method để format error message rõ ràng cho dev
   * @param error - Error object từ HTTP request
   * @param endpoint - API endpoint bị lỗi
   * @param requestBody - Request body đã gửi (optional)
   */
  private getErrorMessage(error: any, endpoint: string, requestBody?: any): string {
    let errorHtml = `<div style="text-align: left; font-size: 13px;">`;
    
    errorHtml += `<p><strong>API:</strong> <code style="background: #f0f0f0; padding: 2px 6px;">${endpoint}</code></p>`;
    
    if (error?.status) {
      errorHtml += `<p><strong>Status Code:</strong> <span style="color: #dc3545;">${error.status}</span></p>`;
    }
    
    if (error?.error?.message) {
      errorHtml += `<p><strong>Message:</strong> ${error.error.message}</p>`;
    } else if (error?.message) {
      errorHtml += `<p><strong>Message:</strong> ${error.message}</p>`;
    }
    
    if (error?.error?.errors) {
      errorHtml += `<p><strong>Chi tiết:</strong><br/>`;
      if (typeof error.error.errors === 'object') {
        Object.entries(error.error.errors).forEach(([key, value]: any) => {
          errorHtml += `• ${key}: ${Array.isArray(value) ? value.join(', ') : value}<br/>`;
        });
      } else {
        errorHtml += error.error.errors;
      }
      errorHtml += `</p>`;
    }
    
    if (error?.statusText) {
      errorHtml += `<p><strong>Status:</strong> ${error.statusText}</p>`;
    }
    
    // Thêm thông tin URL nếu có
    if (error?.url) {
      errorHtml += `<p style="font-size: 11px; color: #666;"><strong>URL:</strong> ${error.url}</p>`;
    }
    
    // Hiển thị request body để dev dễ debug
    if (requestBody !== undefined) {
      errorHtml += `<p><strong>Request Body:</strong></p>`;
      errorHtml += `<pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(requestBody, null, 2)}</pre>`;
    }
    
    errorHtml += `<p style="font-size: 11px; color: #999; margin-top: 10px;">💡 Mở DevTools (F12) &gt; Console để xem chi tiết đầy đủ</p>`;
    
    errorHtml += `</div>`;
    
    return errorHtml;
  }
}
