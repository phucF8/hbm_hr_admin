import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ThongBaoService } from '../../services/thong-bao.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { NOTIFICATION_TYPES, NotificationType } from '../../constants/notification-types';
import { ITEMS_PER_PAGE } from '../../constants/pagination.constants';
import { MatDialog } from '@angular/material/dialog';
import { TbchitietDialogComponent } from './tbchitiet-dialog/tbchitiet-dialog.component';
import { ThongBao } from '../../models/thong-bao.model'; // Import the ThongBao interface


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
  loaiThongBao?: number | null = null; // null: tất cả, 1: tự động, 2: chủ động
  

  showCreatePopup: boolean = false;
  showAdvancedSearch: boolean = false;

  constructor(
    private dialog: MatDialog,
    private thongBaoService: ThongBaoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadListThongBao(this.ngayTaoTu, this.ngayTaoDen, this.ngayGuiTu, this.ngayGuiDen, this.trangThai);
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.tenNhanVien = currentUser.TenNhanVien;
    }
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadListThongBao(this.ngayTaoTu, this.ngayTaoDen, this.ngayGuiTu, this.ngayGuiDen, this.trangThai);
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.loadListThongBao(this.ngayTaoTu, this.ngayTaoDen, this.ngayGuiTu, this.ngayGuiDen, this.trangThai);
  }

  onSearchTextChange() {  
    this.loadListThongBao(this.ngayTaoTu, this.ngayTaoDen, this.ngayGuiTu, this.ngayGuiDen, this.trangThai);
  }

  loadListThongBao(
    ngayTaoTu?: string,
    ngayTaoDen?: string,
    ngayGuiTu?: string,
    ngayGuiDen?: string,
    trangThai?: number | null,
  ) {
    console.log('Danh sachs thong bao');
    this.thongBaoService.getListThongBao(
      this.currentPage,
      this.sortBy,
      this.searchText,
      ngayTaoTu,
      ngayTaoDen,
      ngayGuiTu,
      ngayGuiDen,
      trangThai,
      this.loaiThongBao,
    ).subscribe({
      next: (data) => {
        console.log('Received notifications:', data);
        this.thongBaoList = data.items;
        this.totalPages = Math.ceil(data.totalCount / ITEMS_PER_PAGE);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }
  
  onTypeChange() {
    this.loadListThongBao(this.ngayTaoTu, this.ngayTaoDen, this.ngayGuiTu, this.ngayGuiDen, this.trangThai);
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
    this.editThongBao(id); // Reuse the edit function for viewing
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

  taoThongBaoDialog() {
    const dialogRef = this.dialog.open(TbchitietDialogComponent, {
      width: '1000px', // Điều chỉnh kích thước hộp thoại
      data: { isNew: true } // Gửi dữ liệu nếu cần
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed', result);
      if (result){
        this.loadListThongBao();
      }
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

  

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }


  handleClosePopup(
    data: {
      response: boolean;
    }
  ): void {
    console.log('ThongBaoComponent: handleClosePopup được gọi');
    this.showAdvancedSearch = false;
    this.showCreatePopup = false; // Đóng popup tạo mới
    if (data.response == true){
      this.loadListThongBao(this.ngayTaoTu, this.ngayTaoDen, this.ngayGuiTu, this.ngayGuiDen, this.trangThai);
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
    loaiThongBao?: number | null;
    }): void {
      this.ngayTaoTu = data.ngayTaoTu;
      this.ngayTaoDen = data.ngayTaoDen;  
      this.ngayGuiTu = data.ngayGuiTu;
      this.ngayGuiDen = data.ngayGuiDen;
      this.trangThai = data.trangThai;
      this.loaiThongBao = data.loaiThongBao;
      this.loadListThongBao(data.ngayTaoTu, data.ngayTaoDen, data.ngayGuiTu, data.ngayGuiDen, data.trangThai);
      this.showAdvancedSearch = false; // Đóng popup sau khi tìm kiếm
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

  
  handleCreate(data: any) {
    // Xử lý dữ liệu tạo mới
    console.log('Created:', data);
  }

  toggleCreatePopup() {
    this.showCreatePopup = !this.showCreatePopup;
  }
  

}
