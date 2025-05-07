import { Component, EventEmitter, OnInit, Input, Output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ThongBaoService } from '../../services/thong-bao.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '@app/services/loading.service';
import { NOTIFICATION_TYPES, NotificationType } from '../../constants/notification-types';
import { ITEMS_PER_PAGE } from '../../constants/pagination.constants';
import { MatDialog } from '@angular/material/dialog';
import { ThongBao } from '../../models/thong-bao.model'; // Import the ThongBao interface
import { ToastrService } from 'ngx-toastr';
import { DebugUtils } from '@app/utils/debug-utils';
import { XuatFileComponent } from '../xuat-file/xuat-file.component';
import * as FileSaver from 'file-saver';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { exportToExcel } from '@app/utils/excel-export.util'; // Import your utility function for exporting to Excel



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
  pageIndex: number = 1;
  isDebug = environment.isDebug;
  tenNhanVien: string = '';
  notificationTypes = NOTIFICATION_TYPES;
  sortBy: string = 'NgayTao'; //mặc định sắp xếp theo ngày tạo mới nhất

  ngayTaoTu?: string;
  ngayTaoDen?: string;
  ngayGuiTu?: string;
  ngayGuiDen?: string;
  trangThai?: number | null = null; // null: tất cả, 1: đã gửi, 0: chưa gửi
  notificationType?: number | null = null; // null: tất cả, 1: tự động, 2: chủ động
  loaiThongBao?: string | null = null;


  notificationId: string = '';
  showThongBaoPopup: boolean = false;
  showSearchPopup: boolean = false;

  constructor(
    private dialog: MatDialog,
    private thongBaoService: ThongBaoService,
    private loadingService: LoadingService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.loadListThongBao();
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.tenNhanVien = currentUser.TenNhanVien;
    }
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadListThongBao();
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.loadListThongBao();
  }

  onSearchTextChange() {
    this.loadListThongBao();
  }

  loadListThongBao() {
    this.loadingService.show();
    this.thongBaoService.getListThongBao(
      this.currentPage,
      this.sortBy,
      this.searchText,
      this.ngayTaoTu,
      this.ngayTaoDen,
      this.ngayGuiTu,
      this.ngayGuiDen,
      this.trangThai,
      this.notificationType,
      this.loaiThongBao,
    ).subscribe({
      next: (data) => {
        this.thongBaoList = data.items;
        this.totalPages = Math.ceil(data.totalCount / ITEMS_PER_PAGE);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loadingService.hide();
      }
    });
  }

  loadListThongBaoForPages(selectedPages: number[]): Observable<any[]> {
    this.loadingService.show();
    const requests = selectedPages.map(page => 
      this.thongBaoService.getListThongBao(
        page,
        this.sortBy,
        this.searchText,
        this.ngayTaoTu,
        this.ngayTaoDen,
        this.ngayGuiTu,
        this.ngayGuiDen,
        this.trangThai,
        this.notificationType,
        this.loaiThongBao
      )
    );
    return forkJoin(requests).pipe(
      map(results => {
        const allItems = results.flatMap(res => res.items);
        this.loadingService.hide();
        return allItems;
      }),
      catchError(error => {
        console.error('Error loading notifications for selected pages:', error);
        this.loadingService.hide();
        throw error;
      })
    );
  }

  onTypeChange() {
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

  viewThongBao(id: string) {
    document.body.classList.add('no-scroll');
    this.showThongBaoPopup = true;
    this.notificationId = id;
  }

  // Hàm chọn tất cả checkbox
  toggleSelectAll() {
    this.thongBaoList.forEach(tb => {
      if (tb.status !== 1) {
        tb.selected = this.selectAll;
      }
    });

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



  logout() {
    console.log('🚪 Logging out user');
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      console.log('✅ Successfully logged out and redirected to login page');
    }).catch(error => {
      console.error('❌ Error during logout:', error);
    });
  }

  deleteThongBao(id: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa thông báo này?`)) {
      console.log("Deleting notification with ID:", id);
      this.thongBaoService.deleteThongBao(id).subscribe({
        next: () => {
          console.log('Successfully deleted notification with ID:', id);
          this.loadListThongBao(); // Reload the list
          alert('Đã xóa thành công thông báo!');
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          alert('Đã xảy ra lỗi khi xóa thông báo!');
        }
      });
    }
  }

  openSearchPopup(): void {
    this.showSearchPopup = true;
    document.body.classList.add('no-scroll');
  }

  handleClosePopup(
    data: {
      response: boolean;
    }
  ): void {
    document.body.classList.remove('no-scroll');
    this.showSearchPopup = false;
    this.showThongBaoPopup = false; // Đóng popup tạo mới
    if (data.response == true) {
      this.loadListThongBao();
    }
    // Thêm logic đóng popup, hoặc xử lý UI tại đây
  }

  handleSearchPopup(
    data: {
      ngayTaoTu?: string;
      ngayTaoDen?: string;
      ngayGuiTu?: string;
      ngayGuiDen?: string;
      trangThai?: number | null;
      notificationType?: number | null; //1 tự động 2 chủ động
      loaiThongBao?: string | null;  //vd RQ, GT, ...
    }): void {
    this.ngayTaoTu = data.ngayTaoTu;
    this.ngayTaoDen = data.ngayTaoDen;
    this.ngayGuiTu = data.ngayGuiTu;
    this.ngayGuiDen = data.ngayGuiDen;
    this.trangThai = data.trangThai;
    this.notificationType = data.notificationType;
    this.loaiThongBao = data.loaiThongBao;
    this.loadListThongBao();
    this.showSearchPopup = false; // Đóng popup sau khi tìm kiếm
    document.body.classList.remove('no-scroll');
  }

  sortByDate(field: string, direction: 'asc' | 'desc') {
    // if (!this.data || !Array.isArray(this.data)) {
    //   return;
    // }

    // this.data.sort((a: any, b: any) => {
    //   const dateA = new Date(a[field]).getTime();
    //   const dateB = new Date(b[field]).getTime();

    //   if (direction === 'asc') {
    //     return dateA - dateB;
    //   } else {
    //     return dateB - dateA;
    //   }
    // });
  }

  openedMenuId: string | null = null;

  toggleMenu(tb: any) {
    if (this.openedMenuId === tb.id) {
      // Nếu menu này đang mở -> đóng lại
      this.openedMenuId = null;
    } else {
      // Đóng tất cả và mở menu mới
      this.openedMenuId = tb.id;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown-wrapper');
    if (!clickedInside) {
      this.openedMenuId = null;
    }
  }


  formatDate(dateString: string): string {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  exportCurrentPage(data: any) {
    const selectedPages = [data.currentPage]; // Chỉ xuất trang hiện tại
    this.loadListThongBaoForPages(selectedPages).subscribe(data => {
      exportToExcel(data); // Xuất dữ liệu đã tải về
    });
  }

  exportPageRange(fromPage: number, toPage: number) {
    if (fromPage > toPage) {
      console.error('Trang bắt đầu không thể lớn hơn trang kết thúc.');
      return;
    }
    const selectedPages = [];
    for (let page = fromPage; page <= toPage; page++) {
      selectedPages.push(page);
    }
    this.loadListThongBaoForPages(selectedPages).subscribe(data => {
      exportToExcel(data);
    });
  }

  exportSpecificPages(pageList: string) {
    const pages = pageList.split(',').map(page => parseInt(page.trim(), 10));
    const selectedPages = pages; // Chỉ xuất trang hiện tại
    this.loadListThongBaoForPages(selectedPages).subscribe(data => {
      exportToExcel(data); // Xuất dữ liệu đã tải về
    });
  }

  xuatFile(data: any): void {
    switch (data.exportOption) {
      case 'current':
        const dataTest = [
          { id: 1, name: 'Nguyen Van A', age: 30 },
          { id: 2, name: 'Tran Thi B', age: 25 }
        ];
        this.exportCurrentPage(dataTest);
        break;
      case 'range':
        this.exportPageRange(data.fromPage, data.toPage);
        break;
      case 'list':
        this.exportSpecificPages(data.pageList);
        break;
      default:
        console.error('Chọn phương thức xuất không hợp lệ');
    }

    this.toastr.success('...', `${data.fromPage} - ${data.toPage}`, {
      positionClass: 'toast-top-center',
      timeOut: 5000, // 5s
      progressBar: true
    });
  }

  openXuatFile() {
    const dialogRef = this.dialog.open(XuatFileComponent, {
      width: '400px',
      data: {} // nếu muốn truyền gì đó
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.xuatFile(result);
      }
    });
  }


  handleCreate(data: any) {
    // Xử lý dữ liệu tạo mới
    console.log('Created:', data);
  }

  openTaoThongBaoPopup() {
    this.notificationId = '';
    this.showThongBaoPopup = true;
    document.body.classList.add('no-scroll');
  }


}
