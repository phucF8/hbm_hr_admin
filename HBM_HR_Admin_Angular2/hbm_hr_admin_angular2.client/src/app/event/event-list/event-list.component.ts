import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EventItem, EventRequest } from '@app/models/event.model';
import { EventService } from '@app/services/event.service';
import { LoadingService } from '@app/services/loading.service';
import { UtilsService } from '@app/utils/utils.service';
import { PAGINATION_CONFIG } from '@app/constants/api.constants';
import Swal from 'sweetalert2';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { EventPreviewDialogComponent } from '../event-preview-dialog/event-preview-dialog.component';

/**
 * Component quản lý danh sách Event HTML
 * Event là nội dung HTML được hiển thị trên mobile app
 * Hỗ trợ CRUD (Create, Read, Update, Delete) và quản lý trạng thái IsActive
 * APIs: getActiveEvent, getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, toggleEventStatus
 */
@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {

  openedMenuId: string | null = null;

  // Filter properties
  searchText: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';

  events: EventItem[] = [];
  totalPage: number = 0;
  selectAll: boolean = false;

  // Query params
  queryParams: EventRequest = {
    pageNumber: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    search: '',
    status: ''
  };

  constructor(
    private eventService: EventService,
    private loadingService: LoadingService,
    public utils: UtilsService,
    private dialog: MatDialog
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown-wrapper');
    if (!clickedInside) {
      this.openedMenuId = null;
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load danh sách events từ API getAllEvents
   * Thêm property 'selected' cho mỗi item để hỗ trợ select multiple checkbox
   */
  loadData(): void {
    this.loadingService.show();
    
    this.eventService.getAllEvents(this.queryParams).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          // Backend trả về data là array trực tiếp
          const eventList = Array.isArray(response.data) ? response.data : [];
          this.events = eventList.map((item: any) => ({ 
            ...item, 
            selected: false,
            generatedHtml: item.generatedHtml || item.GeneratedHtml // Map từ API response
          }));
          this.totalPage = 1; // Backend chưa hỗ trợ phân trang
        } else {
          Swal.fire('Lỗi', response.message, 'error');
        }
        this.loadingService.hide();
      },
      error: (error) => {
        this.loadingService.hide();
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          text: error.message || 'Không thể tải danh sách events'
        });
      }
    });
  }

  applyFilters(): void {
    this.queryParams.pageNumber = 1;
    this.queryParams.search = this.searchText;
    this.queryParams.status = this.selectedStatus;
    this.queryParams.fromDate = this.startDate;
    this.queryParams.toDate = this.endDate;
    this.loadData();
  }

  onPageChange(pageNumber: number): void {
    this.queryParams.pageNumber = pageNumber;
    this.loadData();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.queryParams = {
      pageNumber: 1,
      pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      search: '',
      status: ''
    };
    this.loadData();
  }

  toggleSelectAll(): void {
    this.events.forEach(event => {
      event.selected = this.selectAll;
    });
  }

  toggleMenu(event: EventItem): void {
    if (this.openedMenuId === event.id) {
      this.openedMenuId = null;
    } else {
      this.openedMenuId = event.id;
    }
  }

  closeMenu(): void {
    this.openedMenuId = null;
  }

  /**
   * Mở dialog tạo event mới
   * Dialog sẽ được khởi tạo với data = null để component xác định đây là Create mode
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(EventDetailComponent, {
      width: '880px',
      maxWidth: '96vw',
      height: '92vh',
      data: null // null = create mode
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  /**
   * Mở dialog chỉnh sửa event
   * Truyền event data để component xác định đây là Edit mode
   */
  openEditDialog(event: EventItem): void {
    this.closeMenu();
    const dialogRef = this.dialog.open(EventDetailComponent, {
      width: '880px',
      maxWidth: '96vw',
      height: '92vh',
      data: event
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  /**
   * Xem chi tiết và preview HTML content của event
   * Mở HTML trong dialog hình điện thoại
   */
  viewDetail(event: EventItem): void {
    this.closeMenu();
    
    // Nếu event chưa có generatedHtml, gọi API để lấy
    if (!event.generatedHtml) {
      this.loadingService.show();
      this.eventService.getEventById(event.id).subscribe({
        next: (response) => {
          this.loadingService.hide();
          if (response.status === 'SUCCESS' && response.data) {
            const eventData = response.data as any;
            // Update event với data đầy đủ từ server
            const fullEvent = {
              ...event,
              ...eventData,
              generatedHtml: eventData.generatedHtml || eventData.GeneratedHtml
            };
            this.openPreviewDialog(fullEvent);
          } else {
            Swal.fire('Lỗi', 'Không thể tải event', 'error');
          }
        },
        error: (error) => {
          this.loadingService.hide();
          Swal.fire('Lỗi', 'Không thể tải event', 'error');
        }
      });
    } else {
      this.openPreviewDialog(event);
    }
  }

  /**
   * Mở dialog preview HTML với hình dạng điện thoại
   */
  private openPreviewDialog(event: EventItem): void {
    if (!event.generatedHtml) {
      Swal.fire('Thông báo', 'Không có nội dung HTML', 'info');
      return;
    }

    this.dialog.open(EventPreviewDialogComponent, {
      width: '420px',
      height: '90vh',
      maxHeight: '800px',
      data: {
        event: event
      },
      panelClass: 'phone-preview-dialog'
    });
  }

  /**
   * Xóa 1 event sau khi xác nhận
   * Gọi API deleteEvent
   */
  deleteEvent(event: EventItem): void {
    this.closeMenu();
    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc muốn xóa event "${event.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.show();
        this.eventService.deleteEvent(event.id).subscribe({
          next: (response) => {
            this.loadingService.hide();
            if (response.status === 'SUCCESS') {
              Swal.fire('Thành công', 'Đã xóa event', 'success');
              this.loadData();
            } else {
              Swal.fire('Lỗi', response.message, 'error');
            }
          },
          error: (error) => {
            this.loadingService.hide();
            Swal.fire('Lỗi', 'Không thể xóa event', 'error');
          }
        });
      }
    });
  }

  /**
   * Xóa nhiều events đã được chọn
   * Lọc ra các event có selected = true và gọi xóa từng cái
   * (Backend không hỗ trợ deleteMultiple nên sẽ xóa từng cái)
   */
  deleteSelected(): void {
    const selectedIds = this.events.filter(e => e.selected).map(e => e.id);
    if (selectedIds.length === 0) {
      Swal.fire('Thông báo', 'Vui lòng chọn ít nhất 1 event để xóa', 'info');
      return;
    }

    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc muốn xóa ${selectedIds.length} event đã chọn?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.show();
        // Since backend doesn't support deleteMultiple, delete one by one
        let deletedCount = 0;
        selectedIds.forEach(id => {
          this.eventService.deleteEvent(id).subscribe({
            next: (response) => {
              if (response.status === 'SUCCESS') {
                deletedCount++;
              }
              if (deletedCount === selectedIds.length) {
                this.loadingService.hide();
                Swal.fire('Thành công', `Đã xóa ${deletedCount} event`, 'success');
                this.selectAll = false;
                this.loadData();
              }
            },
            error: (error) => {
              console.error('Error deleting event:', error);
            }
          });
        });
      }
    });
  }

  /**
   * Toggle trạng thái IsActive của event
   * Gọi API toggleEventStatus
   */
  toggleStatus(event: EventItem): void {
    this.closeMenu();
    const newStatus = !event.isActive;
    
    this.eventService.toggleEventStatus(event.id).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          event.isActive = newStatus;
          Swal.fire('Thành công', `Đã ${newStatus ? 'hiển thị' : 'ẩn'} event`, 'success');
        } else {
          Swal.fire('Lỗi', response.message, 'error');
        }
      },
      error: (error) => {
        Swal.fire('Lỗi', 'Không thể cập nhật trạng thái', 'error');
      }
    });
  }

  formatDateTime(dateStr?: string | Date | null): string {
    if (!dateStr) return 'N/A';
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return date.toLocaleString('vi-VN');
    } catch {
      return 'N/A';
    }
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Hiển thị' : 'Ẩn';
  }

  /**
   * Kiểm tra xem có event nào được chọn không
   * Sử dụng trong template để hiển thị nút Xóa đã chọn
   */
  hasSelectedEvents(): boolean {
    return this.events.some(e => e.selected);
  }
}

