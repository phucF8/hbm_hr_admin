import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GopYItem, GopYRequest } from '@app/models/gopy.model';
import { QuestionManagerComponent } from '@app/question-manager/question-manager.component';
import { GopYService } from '@app/services/gop-y.service';
import { LoadingService } from '@app/services/loading.service';
import { InputFormComponent } from "@app/uicomponents/input-form/input-form.component";
import { PaginationComponent } from "@app/components/pagination/pagination.component";
import { UtilsService } from '@app/utils/utils.service';
import { PAGINATION_CONFIG } from '@app/constants/api.constants';


@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.component.html',
  styleUrls: ['./feedback-management.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
})
export class FeedbackManagementComponent implements OnInit {

  openedMenuId: any;

  // Filter properties
  searchText: string = '';
  selectedType: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';

  filteredFeedbacks: GopYItem[] = [];
  totalPage: number = 0;

  constructor(
    private gopYService: GopYService,
    private loadingService: LoadingService, // Giả định bạn có loading service
    public utils: UtilsService
  ) { }

  // Khởi tạo params mặc định
  queryParams: GopYRequest = {
    pageNumber: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    search: "",
    trangThai: "",
    filterType: ""
  };

  ngOnInit(): void {
    this.loadData();
  }

  applyFilters(): void {
    this.queryParams.pageNumber = 1;
    this.queryParams.search = this.searchText;
    this.queryParams.trangThai = this.selectedStatus;
    this.loadData();
  }

  onPageChange($event: number) {
    this.queryParams.pageNumber = $event;
    this.queryParams.search = this.searchText;
    this.queryParams.trangThai = this.selectedStatus;
    this.loadData();
  }

  clearFilters(): void {

  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'GY_CD': 'chưa đọc',
      'GY_DD': 'đã đọc',
    };
    return statusMap[status] || status;
  }

  viewFeedback(id: string): void {
    console.log('View feedback:', id);
  }

  editFeedback(id: string): void {
    console.log('Edit feedback:', id);
  }

  deleteFeedback(id: string): void {

  }

  loadData() {
    this.loadingService.show();
    this.gopYService.getAllGopYs(this.queryParams).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.filteredFeedbacks = res.data.items;
          this.totalPage = Math.ceil(res.data.totalItems / this.queryParams.pageSize);
        }
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách góp ý:', err);
        this.loadingService.hide();
      }
    });
  }

  toggleMenu(item: GopYItem) {
    if (this.openedMenuId === item.id) {
      // Nếu menu này đang mở -> đóng lại
      this.openedMenuId = null;
    } else {
      // Đóng tất cả và mở menu mới
      this.openedMenuId = item.id;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown-wrapper');
    if (!clickedInside) {
      this.openedMenuId = null;
    }
  }


}