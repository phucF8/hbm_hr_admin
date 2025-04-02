import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ThongBaoService, ThongBao } from '../../services/thong-bao.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { NOTIFICATION_TYPES, NotificationType } from '../../constants/notification-types';
import { ITEMS_PER_PAGE } from '../../constants/pagination.constants';

import { MatDialog } from '@angular/material/dialog';
import { TbchitietComponent } from '../thong-bao/tbchitiet/tbchitiet.component';

@Component({
  selector: 'app-thong-bao',
  templateUrl: './thong-bao.component.html',
  styleUrls: ['./thong-bao.component.css'],
  standalone: false,
})
export class ThongBaoComponent implements OnInit {
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  thongBaoList: ThongBao[] = [];
  selectAll: boolean = false;
  searchText: string = '';
  selectedType: number = 0; // 0: Tất cả
  pageIndex: number = 1;
  isDebug = environment.isDebug;
  tenNhanVien: string = '';
  notificationTypes = NOTIFICATION_TYPES;

  constructor(
    private dialog: MatDialog,
    private thongBaoService: ThongBaoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadListThongBao();
    // Get current user info
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.tenNhanVien = currentUser.TenNhanVien;
    }
  }

  onPageChange(newPage: number) {
    console.log('onPageChange:', newPage);
    this.currentPage = newPage;
    this.loadListThongBao();
  }

  loadListThongBao() {
    console.log('Loading notifications for page:', this.currentPage, 'and type:', this.selectedType);
    this.thongBaoService.getListThongBao(this.currentPage, this.selectedType).subscribe({
      next: (data) => {
        console.log('Received notifications:', data);
        this.thongBaoList = data.items; // Gán danh sách thông báo từ `items`
        this.totalPages = Math.ceil(data.totalCount / ITEMS_PER_PAGE); // Sử dụng constant
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  onTypeChange() {
    console.log('Type changed to:', this.selectedType);
    this.loadListThongBao();
  }

  sendAgain() {
    console.log('sendAgain');
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
          this.loadListThongBao(); // Reload the list
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
    this.router.navigate(['/thong-bao/tbchitiet', id]).then(() => {
      console.log('✅ Navigation completed successfully');
    }).catch(error => {
      console.error('❌ Navigation failed:', error);
    });
  }
  
  // Hàm chọn tất cả checkbox
  toggleSelectAll() {
    this.thongBaoList.forEach(tb => tb.selected = this.selectAll);
  }

  getNotificationTypeName(typeId: number): string {
    const type = this.notificationTypes.find(t => t.id === typeId);
    return type ? type.name : 'Không xác định';
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
          this.loadListThongBao(); // Reload the list
        },
        error: (error) => {
          console.error('❌ Error deleting notifications:', error);
          alert('Đã xảy ra lỗi khi xóa thông báo!');
        }
      });
    }
  }

  taoThongBao() {
    this.router.navigate(['/thong-bao/tbchitiet']).then(() => {
      console.log('✅ Navigation completed successfully');
    }).catch(error => {
      console.error('❌ Navigation failed:', error);
    });
  }

  taoThongBaoDialog() {
    const dialogRef = this.dialog.open(TbchitietComponent, {
      width: '600px', // Điều chỉnh kích thước hộp thoại
      data: { isNew: true } // Gửi dữ liệu nếu cần
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
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
