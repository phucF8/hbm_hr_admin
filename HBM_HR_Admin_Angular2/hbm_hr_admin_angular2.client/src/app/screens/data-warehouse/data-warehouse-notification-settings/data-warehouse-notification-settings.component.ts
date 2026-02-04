import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SearchUserFormComponent } from '@app/uicomponents/search-user-form/search-user-form.component';

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
    public dialogRef: MatDialogRef<DataWarehouseNotificationSettingsComponent>
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // TODO: Gọi API để lấy danh sách user và trạng thái nhận log lỗi
    this.users = [
      { id: '1', name: 'Admin', email: 'admin@example.com', receiveErrors: true },
      { id: '2', name: 'User 1', email: 'user1@example.com', receiveErrors: false },
      { id: '3', name: 'User 2', email: 'user2@example.com', receiveErrors: true }
    ];
  }

  toggleNotification(user: UserNotificationSetting): void {
    user.receiveErrors = !user.receiveErrors;
  }

  // Unselect / remove from recipients (keeps user in list but disables notification)
  removeRecipient(user: UserNotificationSetting): void {
    user.receiveErrors = false;
  }

  // Accept selected users emitted by app-search-user-form
  onSelectedUsersChange(selectedUsers: any[]) {
    if (!selectedUsers || !Array.isArray(selectedUsers)) return;
    // mark existing and add new ones
    selectedUsers.forEach(s => {
      const id = s.ID ?? s.id ?? s.MaNhanVien ?? s.MaNhanVien;
      const existing = this.users.find(u => u.id === id);
      if (existing) {
        existing.receiveErrors = true;
      } else {
        this.users.push({
          id: id,
          name: s.TenNhanVien || s.MaNhanVien || id,
          email: s.Email || '',
          receiveErrors: true
        });
      }
    });
  }

  saveSettings(): void {
    // TODO: Gọi API để lưu cấu hình nhận log lỗi
    console.log('Saving notification settings:', this.users);
    this.dialogRef.close(this.users);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
