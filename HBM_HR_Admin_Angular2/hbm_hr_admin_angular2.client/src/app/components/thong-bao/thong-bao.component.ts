import { Component, EventEmitter, OnInit, Input, Output, HostListener } from '@angular/core';
import { ThongBaoService } from '../../services/thong-bao.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '@app/services/loading.service';
import { NOTIFICATION_TYPES } from '../../constants/notification-types';
import { ITEMS_PER_PAGE } from '../../constants/pagination.constants';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { XuatFileComponent } from '../xuat-file/xuat-file.component';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { exportToExcel } from '@app/utils/excel-export.util'; // Import your utility function for exporting to Excel

import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { DonVi } from '@app/models/donvi';
import { MergedData } from '@app/models/thong-bao.model';
import { DanhSachNguoiNhan, ThongBaoItem } from '@app/responses/thongbao_rp';
import Swal from 'sweetalert2';
import { ErrorService } from '@app/services/error.service';
import { InputFormComponent } from '@app/uicomponents/input-form/input-form.component';
import { FromToDateFormComponent } from '@app/uicomponents/from-to-date-form/from-to-date-form.component';
import { OneSelectFormComponent } from '@app/uicomponents/one-select-form/one-select-form.component';
import { CommonModule } from '@angular/common';
import { SearchUserFormComponent } from '@app/uicomponents/search-user-form/search-user-form.component';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { TbchitietComponent } from './tbchitiet/tbchitiet.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-thong-bao',
  templateUrl: './thong-bao.component.html',
  styleUrls: ['./thong-bao.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputFormComponent,
    FromToDateFormComponent,
    OneSelectFormComponent,
    SearchUserFormComponent,
    AdvancedSearchComponent,
    TbchitietComponent,
    PaginationComponent,
  ]   // 👈 thêm dòng này
})
export class ThongBaoComponent implements OnInit {
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  thongBaoList: ThongBaoItem[] = [];
  selectAll: boolean = false;
  searchText: string = '';
  pageIndex: number = 1;
  tenNhanVien: string = '';
  notificationTypes = NOTIFICATION_TYPES;
  sortBy: string = 'NgayTao'; //mặc định sắp xếp theo ngày tạo mới nhất

  ngayTaoTu?: string;
  ngayTaoDen?: string;
  ngayGuiTu?: string;
  ngayGuiDen?: string;
  trangThai?: number | null = null; // null: tất cả, 1: đã gửi, 0: chưa gửi
  notificationType?: number | null = null; // null: tất cả, 1: tự động, 2: chủ động
  isSentToAll?: number | null = null; // null: tất cả, 1: đã hoàn thành, 2: chưa hoàn thành
  isPlatform?: string | null = null; // null: tất cả, MB: là mobile, WEB: là web
  loaiThongBao?: string | null = null;
  nhomThongBaoOptions = [
    { value: null, label: 'Tất cả' },
    { value: 'RQ', label: 'Đề xuất' },
    { value: 'GT', label: 'Giải trình' },
    { value: 'XE', label: 'Đặt xe' },
    { value: 'ROOM', label: 'Đặt phòng họp' },
    { value: 'KPI', label: 'KPIs' },
  ];
  notificationTypeOptions = [
    { value: null, label: 'Tất cả' },
    { value: 1, label: 'Tự động' },
    { value: 2, label: 'Chủ động' },
  ];
  sentToAllOptions = [
    { value: null, label: 'Tất cả' },
    { value: 1, label: 'Đã hoàn thành' },
    { value: 2, label: 'Chưa hoàn thành' },
  ];
  platformOptions = [
    { value: null, label: 'Tất cả' },
    { value: 'MB', label: 'Mobile' },
    { value: 'WEB', label: 'Web' },
  ];

  notificationId: string = '';
  showThongBaoPopup: boolean = false;
  showSearchPopup: boolean = false;

  ITEMS_PER_PAGE = ITEMS_PER_PAGE; // <- expose ra để dùng trong HTML


  searchUserForm: FormGroup;
  filteredUsers: MergedData[] = [];
  isSearching: boolean = false;
  selectedDonVi: DonVi | null = null;

  showDonVisPopup = false;
  isFocused = false;
  ngTaoIds: MergedData[] = [];
  ngNhanIds: MergedData[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private thongBaoService: ThongBaoService,
    private loadingService: LoadingService,
    private errorService: ErrorService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {
    this.searchUserForm = this.fb.group({
      search: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // format YYYY-MM-DD
    this.ngayTaoTu = formattedToday;
    this.ngayTaoDen = formattedToday;
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

  hasSelectedThongBao(): boolean {
    return this.thongBaoList.some(tb => tb.selected);
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * ITEMS_PER_PAGE + (index + 1);
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
      this.isSentToAll,
      this.loaiThongBao,
      this.isPlatform,
      this.ngTaoIds.map(user => user.ID), // Chuyển đổi danh sách người dùng đã chọn thành danh sách ID
      this.ngNhanIds.map(user => user.ID)
    ).subscribe({
      next: (data) => {
        this.thongBaoList = data.items;
        this.totalPages = Math.ceil(data.totalCount / ITEMS_PER_PAGE);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loadingService.hide();
        this.errorService.showError([JSON.stringify(error, null, 2)]);
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Lỗi tải dữ liệu',
        //   html: `<pre style="text-align:left;">ERR: ${JSON.stringify(error, null, 2)}</pre>`,
        //   confirmButtonText: 'Đóng'
        // });

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
        this.isSentToAll,
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

  getActionName(content: string): string {
    if (!content) return '';

    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('request') && lowerContent.includes('yêu cầu')) {
      return 'Tạo Request';
    }

    if (lowerContent.includes('request') && lowerContent.includes('xác nhận')) {
      return 'Duyệt Request';
    }

    if (lowerContent.includes('request') && lowerContent.includes('thảo luận')) {
      return 'Thảo luận Request';
    }

    if (lowerContent.includes('giải trình') && lowerContent.includes('yêu cầu')) {
      return 'Tạo Giải trình';
    }

    if (lowerContent.includes('giải trình') && lowerContent.includes('xác nhận')) {
      return 'Duyệt Giải trình';
    }

    return '';
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
      isSentToAll?: number | null; //1 đã hoàn thành 2 chưa hoàn thành
      loaiThongBao?: string | null;  //vd RQ, GT, ...
    }): void {
    this.ngayTaoTu = data.ngayTaoTu;
    this.ngayTaoDen = data.ngayTaoDen;
    this.ngayGuiTu = data.ngayGuiTu;
    this.ngayGuiDen = data.ngayGuiDen;
    this.trangThai = data.trangThai;
    this.notificationType = data.notificationType;
    this.isSentToAll = data.isSentToAll;
    this.loaiThongBao = data.loaiThongBao;
    this.loadListThongBao();
    this.showSearchPopup = false; // Đóng popup sau khi tìm kiếm
    document.body.classList.remove('no-scroll');
  }

  timKiem() {
    // this.ngayTaoTu
    // this.ngayTaoDen
    // this.ngayGuiTu - có vẻ dư thừa
    // this.ngayGuiDen - có vẻ dư thừa
    // this.trangThai - có vẻ dư thừa
    // this.notificationType - loai thong bao RQ, GT, ...
    // this.isSentToAll - mưc độ hoàn thành;
    // this.loaiThongBao = chủ động hay tự động;
    this.loadListThongBao();

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
        this.exportCurrentPage(data);
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
      data: { currentPage: this.currentPage } // nếu muốn truyền gì đó
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

  ngTaoSelected(users: any[]) {
    this.ngTaoIds = users;
  }

  ngNhanSelected(users: any[]) {
    this.ngNhanIds = users;
  }

  onSearchUser() {
    const searchValue = this.searchUserForm.get('search')?.value?.trim();
    if (!searchValue) {
      this.filteredUsers = []; // Đặt về null nếu không có từ khóa tìm kiếm
      return;
    }
    this.isSearching = true;
    this.filteredUsers = []; // Reset trước khi tìm kiếm
    this.thongBaoService.searchUsers(searchValue, this.selectedDonVi?.id || '')
      .pipe(finalize(() => this.isSearching = false)) // Đảm bảo luôn thực hiện
      .subscribe({
        next: (response) => {
          this.filteredUsers = (response?.DatasLookup || []).map(user => ({
            ID: user.ID,
            MaNhanVien: user.MaNhanVien,
            TenNhanVien: user.TenNhanVien,
            TenPhongBan: user.TenPhongBan,
            status: 0 // Gán giá trị mặc định vì DoLookupData không có "status"
          })) as MergedData[];
        },
        error: (error) => {
          console.error('Lỗi tìm kiếm người dùng:', error);
          this.filteredUsers = []; // Tránh giữ kết quả sai
        }
      });
  }


  openDonVisPopup() {
    this.showDonVisPopup = !this.showDonVisPopup;
  }

  selectDonVi(item: DonVi): void {
    this.selectedDonVi = item;
    this.showDonVisPopup = false;
  }

  onBlurInput(value: string) {
    setTimeout(() => {
      this.isFocused = false;
      if (value.trim() === '') {
        this.filteredUsers = []; // Đặt về null nếu không có từ khóa tìm kiếm
      }
    }, 200); // 200ms hoặc thời gian bạn mong muốn
  }


  // ngTaoSelected(user: any) {
  //   if (!this.ngTaoIds.find(u => u.ID === user.ID)) {
  //     this.ngTaoIds.push(user);
  //   }

  //   // Log toàn bộ danh sách selectedUsers sau mỗi lần cập nhật
  //   console.log("Current selectedUsers:", this.ngTaoIds.map(u => u.ID));

  //   this.searchUserForm.get('search')?.setValue(''); // Xóa nội dung tìm kiếm sau khi chọn user
  //   this.filteredUsers = []; // Ẩn danh sách gợi ý
  // }

  removeUser(user: any) {
    this.ngTaoIds = this.ngTaoIds.filter(u => u.ID !== user.ID);
  }

  countNguoiNhanSuccess(items: DanhSachNguoiNhan[]): number {
    return items.filter(n => n.status > 0).length;
  }

}
