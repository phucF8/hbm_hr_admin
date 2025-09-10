import { Component } from '@angular/core';
import { HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TopicDetailComponent } from '@app/voting/topic-detail/topic-detail.component';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';
import { VotingListRP } from './responses/voting_list_rp';
import { Observable } from 'rxjs/internal/Observable';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SurveyDetailReportComponent } from '@app/survey/survey-detail-report/survey-detail-report.component';


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
    private router: Router,
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
    this.listItem?.data.items.forEach(tb => {
      tb.selected = this.selectAll;
    });

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
        const errorStatus = error.status;
        const errorMessage = error.message || 'Không rõ lỗi';
        const errorDetail = error.error?.message || JSON.stringify(error.error) || '';

        Swal.fire({
          icon: 'error',
          title: 'Đã xảy ra lỗi khi tải danh sách chủ đề',
          html: error.status === 0
            ? 'Không nhận được phản hồi từ server. Có thể server chưa chạy hoặc bị chặn kết nối.'
            : error.message,
          confirmButtonText: 'Đóng'
        });

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

  view(id: string) {
    this.service.getDetail(id).subscribe({
      next: (topic) => {
        this.dialog.open(TopicDetailComponent, {
          data: topic.data,
          disableClose: true,
          panelClass: 'err-report-detail-dialog', // Thêm class để tùy chỉnh CSS
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw'
        })
          .afterClosed().subscribe(result => {
            if (result) {
              this.loadList();
            }
          });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Đã xảy ra lỗi khi tải chi tiết báo cáo',
          html: error.status === 0
            ? 'Không nhận được phản hồi từ server. Có thể server chưa chạy hoặc bị chặn kết nối.'
            : error.message,
          confirmButtonText: 'Đóng'
        });

      }
    });
  }

  report(topicId: string) {
    //this.router.navigate(['/admin/survey-detail-report', topicId]);
    this.dialog.open(SurveyDetailReportComponent, {
          data:{topicId: topicId},
          disableClose: true,
          panelClass: 'err-report-detail-dialog', // Thêm class để tùy chỉnh CSS
          width: '60vw',
          height: '100vh',
          maxWidth: '100vw'
        });
  }

  openCreateTopicDialog() {
    const dialogRef = this.dialog.open(TopicDetailComponent, {
      data: {},
      disableClose: true,
      panelClass: 'err-report-detail-dialog',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadList(); // Reload danh sách nếu có
        // Gọi API tạo topic ở đây
        // this.service.createTopic(result).subscribe({
        //   next: () => {
        //     console.log('Tạo topic thành công');
        //     alert('Tạo chủ đề thành công!');
        //   },
        //   error: (err) => {
        //     console.error('Lỗi khi tạo topic:', err);
        //     alert('Đã xảy ra lỗi khi tạo chủ đề');
        //   }
        // });
      }
    });
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
    return this.listItem?.data?.items?.some(tb => tb.selected) ?? false;
  }

  deleteListSelected() {
    const selectedNotifications = this.listItem?.data?.items?.filter(tb => tb.selected);

    if (!selectedNotifications || selectedNotifications.length === 0) {
      alert('Vui lòng chọn ít nhất một mục để xóa!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.length} mục đã chọn?`)) {
      const idsToDelete = selectedNotifications.map(tb => tb.id);

      this.service.deleteTopics(idsToDelete).subscribe({
        next: () => {
          this.loadList(); // Tải lại danh sách
          alert('Đã xóa thành công các mục đã chọn!');
        },
        error: (error) => {
          alert(`ERR: ${error.message}`);
        }
      });
    }
  }

}

