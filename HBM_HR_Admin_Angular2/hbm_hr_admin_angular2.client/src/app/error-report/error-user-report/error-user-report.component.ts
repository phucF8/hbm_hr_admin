import { Component } from '@angular/core';
import { ErrorReportService } from '../services/error-report.service';
import { ErrUserReportItem } from '../response/err_user_report_rp';

@Component({
  selector: 'app-error-user-report',
  standalone: false,
  templateUrl: './error-user-report.component.html',
  styleUrl: './error-user-report.component.css'
})
export class ErrorUserReportComponent {

  listItem: ErrUserReportItem[] = [];
  openedMenuId: number | null = null;
  showPopup: boolean = false;
  notificationId: number = 0;
  selectAll: boolean = false;

  constructor(
    private errReportService: ErrorReportService,
  ) {}

  ngOnInit(): void {
    this.loadList();
  }

  toggleSelectAll() {
    this.listItem.forEach(tb => {
      if (tb.status !== 0) {
        tb.selected = this.selectAll;
      }
    });

  }

  loadList() {
      // this.loadingService.show();
      this.errReportService.getList(
        
      ).subscribe({
        next: (data) => {
          this.listItem = data;
          console.log('Loaded notifications:', this.listItem.length);
          // this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          // this.loadingService.hide();
        }
      });
    }


toggleMenu(tb: any) {
    if (this.openedMenuId === tb.id) {
      // Nếu menu này đang mở -> đóng lại
      this.openedMenuId = null;
    } else {
      // Đóng tất cả và mở menu mới
      this.openedMenuId = tb.id;
    }
  }

  view(id: number) {
    this.showPopup = true;
    this.notificationId = id;
  }

  delete(id: number): void {
    if (confirm(`Bạn có chắc chắn muốn xóa mục này không?`)) {
      console.log("Deleting notification with ID:", id);
      this.errReportService.delete(id).subscribe({
        next: () => {
          console.log('Successfully deleted notification with ID:', id);
          this.loadList(); // Reload the list
          alert('Đã xóa thành công');
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          alert('Đã xảy ra lỗi khi xóa');
        }
      });
    }
  }

  deleteSelected() {
    const selectedNotifications = this.listItem.filter(tb => tb.selected);
    if (selectedNotifications.length === 0) {
      alert('Vui lòng chọn ít nhất một thông báo để xóa!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn?`)) {
      const deletePromises = selectedNotifications.map(tb => {

        return this.errReportService.delete(tb.id).toPromise();
      });
      Promise.all(deletePromises)
        .then(() => {
          console.log('Successfully deleted selected notifications');
          
          this.loadList(); // Reload the list
          alert('Đã xóa thành công các thông báo đã chọn!');
        })
        .catch(error => {
          console.error('Error deleting notifications:', error);
          alert('Đã xảy ra lỗi khi xóa thông báo!');
        });
    }
  }

}
