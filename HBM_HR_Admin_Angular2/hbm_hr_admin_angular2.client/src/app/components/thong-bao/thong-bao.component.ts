import { Component, OnInit } from '@angular/core';
import { ThongBaoService, ThongBao } from '../../services/thong-bao.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { NOTIFICATION_TYPES, NotificationType } from '../../constants/notification-types';

@Component({
  selector: 'app-thong-bao',
  templateUrl: './thong-bao.component.html',
  styleUrls: ['./thong-bao.component.css'],
  standalone: false,
})
export class ThongBaoComponent implements OnInit {
  thongBaoList: ThongBao[] = [];
  selectAll: boolean = false;
  searchText: string = '';
  selectedType: number = 0; // 0: Tất cả, 1: Thông báo hệ thống, 2: Thông báo cá nhân, 3: Thông báo nhóm
  isDebug = environment.isDebug;
  tenNhanVien: string = '';
  notificationTypes = NOTIFICATION_TYPES;

  constructor(
    private thongBaoService: ThongBaoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadThongBao();
    // Get current user info
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.tenNhanVien = currentUser.TenNhanVien;
    }
  }

  loadThongBao() {
    console.log('Loading notifications with type:', this.selectedType);
    this.thongBaoService.getThongBao(this.selectedType).subscribe({
      next: (data) => {
        console.log('Received notifications:', data);
        this.thongBaoList = data;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  onTypeChange() {
    console.log('Type changed to:', this.selectedType);
    this.loadThongBao();
  }

  sendAgain() {
    alert('Gửi lại thông báo đã chọn!');
  }

  deleteSelected() {
    const selectedNotifications = this.thongBaoList.filter(tb => tb.selected);
    if (selectedNotifications.length === 0) {
      alert('Vui lòng chọn ít nhất một thông báo để xóa!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn?`)) {
      const deletePromises = selectedNotifications.map(tb => {
        console.log("Deleting notification with ID:", tb.id);
        return this.thongBaoService.deleteThongBao(tb.id).toPromise();
      });
      

      Promise.all(deletePromises)
        .then(() => {
          console.log('Successfully deleted selected notifications');
          this.loadThongBao(); // Reload the list
          alert('Đã xóa thành công các thông báo đã chọn!');
        })
        .catch(error => {
          console.error('Error deleting notifications:', error);
          alert('Đã xảy ra lỗi khi xóa thông báo!');
        });
    }
  }

  editThongBao(id: string) {
    console.log('📝 Navigating to edit notification:', id);
    this.router.navigate(['/thong-bao/sua', id]).then(() => {
      console.log('✅ Navigation completed successfully');
    }).catch(error => {
      console.error('❌ Navigation failed:', error);
    });
  }
  
  // Hàm chọn tất cả checkbox
  toggleSelectAll() {
    this.thongBaoList.forEach(tb => tb.selected = this.selectAll);
  }

  deleteMultiSelected() {
    const selectedIds = this.thongBaoList
      .filter(tb => tb.selected)
      .map(tb => tb.id);

    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất một thông báo để xóa!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo đã chọn?`)) {
      console.log('🗑️ Deleting selected notifications:', selectedIds);
      this.thongBaoService.deleteMultiThongBao(selectedIds).subscribe({
        next: () => {
          console.log('✅ Successfully deleted selected notifications');
          alert('Đã xóa các thông báo đã chọn thành công!');
          this.loadThongBao(); // Reload the list
        },
        error: (error) => {
          console.error('❌ Error deleting notifications:', error);
          alert('Đã xảy ra lỗi khi xóa thông báo!');
        }
      });
    }
  }

  taoThongBao() {
    console.log('📝 Navigating to /thong-bao/tao-moi');
    this.router.navigate(['/thong-bao/tao-moi']).then(() => {
      console.log('✅ Navigation completed successfully');
    }).catch(error => {
      console.error('❌ Navigation failed:', error);
    });
  }

  logout() {
    console.log('🚪 Logging out user');
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      console.log('✅ Successfully logged out and redirected to login page');
    }).catch(error => {
      console.error('❌ Error during logout:', error);
    });
  }
}
