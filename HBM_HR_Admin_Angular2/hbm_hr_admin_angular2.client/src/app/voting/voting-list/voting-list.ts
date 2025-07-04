import { Component } from '@angular/core';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrUserReportItem } from '@app/error-report/response/err_user_report_rp';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';
import { ErrUserReportDetailPopupComponent } from '@app/error-report/error-report-detail/error-report-detail.component';
import { VotingListRP } from './responses/voting_list_rp';

@Component({
  selector: 'app-voting-list',
  standalone: false,
  templateUrl: './voting-list.html',
  styleUrl: './voting-list.css'
})
export class VotingList {

  listItem: VotingListRP | null = null;
  openedMenuId: string | null = null;
  showPopup: boolean = false;
  notificationId: number = 0;
  selectAll: boolean = false;

  constructor(
    private service: VotingListService,
    private dialog: MatDialog,
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown-wrapper');
    if (!clickedInside) {
      this.openedMenuId = null;
    }
  }

  ngOnInit(): void {
    this.loadList();
  }

  toggleSelectAll() {
    // this.listItem.forEach(tb => {
    //   if (tb.status !== 0) {
    //     tb.selected = this.selectAll;
    //   }
    // });

  }

  loadList() {
    // this.loadingService.show();
    this.service.getList(
    ).subscribe({
      next: (data) => {
        this.listItem = data;
        // console.log('Loaded notifications:', this.listItem.length);
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

  closeMenu() {
    this.openedMenuId = null;
  }

  view(id: number) {
    // this.service.getDetail(id).subscribe({
    //   next: (report) => {
    //     console.log('Loaded report detail:', report);
    //     this.dialog.open(ErrUserReportDetailPopupComponent, {
    //     data: report.report,
    //     disableClose: true,
    //     panelClass: 'err-report-detail-dialog', // Thêm class để tùy chỉnh CSS
    //     width: '50vw',
    //     height: '90vh',
    //     maxWidth: '100vw'
    //   })
    // .afterClosed().subscribe(result => {
    //       console.log('Dialog closed with result:', result);
    //       if (result) {
    //         console.log('Dialog result:', result);
    //       }
    //     });
    //   },
    //   error: (error) => {
    //     console.error('Error loading report detail:', error);
    //     alert('Đã xảy ra lỗi khi tải chi tiết báo cáo');
    //   }
    // });
  }

  delete(id: number): void {
    // if (confirm(`Bạn có chắc chắn muốn xóa mục này không?`)) {
    //   console.log("Deleting notification with ID:", id);
    //   this.service.delete(id).subscribe({
    //     next: () => {
    //       console.log('Successfully deleted notification with ID:', id);
    //       this.loadList(); // Reload the list
    //       alert('Đã xóa thành công');
    //     },
    //     error: (error) => {
    //       console.error('Error deleting notification:', error);
    //       alert('Đã xảy ra lỗi khi xóa');
    //     }
    //   });
    // }
  }

  hasSelected(): boolean {
    // return this.listItem.some(tb => tb.selected);
    return false;
  }

  deleteSelected() {
    // const selectedNotifications = this.listItem.filter(tb => tb.selected);
    // if (selectedNotifications.length === 0) {
    //   alert('Vui lòng chọn ít nhất một thông báo để xóa!');
    //   return;
    // }
    // if (confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn?`)) {
    //   const deletePromises = selectedNotifications.map(tb => {

    //     return this.service.delete(tb.id).toPromise();
    //   });
    //   Promise.all(deletePromises)
    //     .then(() => {
    //       console.log('Successfully deleted selected notifications');

    //       this.loadList(); // Reload the list
    //       alert('Đã xóa thành công các thông báo đã chọn!');
    //     })
    //     .catch(error => {
    //       console.error('Error deleting notifications:', error);
    //       alert('Đã xảy ra lỗi khi xóa thông báo!');
    //     });
    // }
  }

}

