import { Component } from '@angular/core';
import { Item } from '@app/responses/thongbao_rp';
import { ErrorReportService } from '../services/error-report.service';

@Component({
  selector: 'app-error-user-report',
  standalone: false,
  templateUrl: './error-user-report.component.html',
  styleUrl: './error-user-report.component.css'
})
export class ErrorUserReportComponent {

  thongBaoList: Item[] = [];
  openedMenuId: string | null = null;
  showThongBaoPopup: boolean = false;
  notificationId: string = '';




  constructor(
    private errReportService: ErrorReportService,
  ) {}


  loadList() {
      // this.loadingService.show();
      this.errReportService.getList(
        
      ).subscribe({
        next: (data) => {
          this.thongBaoList = data.items;
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

  viewThongBao(id: string) {
    document.body.classList.add('no-scroll');
    this.showThongBaoPopup = true;
    this.notificationId = id;
  }

  deleteThongBao(id: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa thông báo này?`)) {
      console.log("Deleting notification with ID:", id);
      this.errReportService.delete(id).subscribe({
        next: () => {
          console.log('Successfully deleted notification with ID:', id);
          this.loadList(); // Reload the list
          alert('Đã xóa thành công thông báo!');
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          alert('Đã xảy ra lỗi khi xóa thông báo!');
        }
      });
    }
  }

  deleteSelected() {
    const selectedNotifications = this.thongBaoList.filter(tb => tb.selected);
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
