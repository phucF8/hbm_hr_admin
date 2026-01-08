import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GopYItem, GopYRequest } from '@app/models/gopy.model';
import { QuestionManagerComponent } from '@app/question-manager/question-manager.component';
import { GopYService } from '@app/services/gop-y.service';
import { LoadingService } from '@app/services/loading.service';
import { InputFormComponent } from "@app/uicomponents/input-form/input-form.component";


@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.component.html',
  styleUrls: ['./feedback-management.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class FeedbackManagementComponent implements OnInit {
  openedMenuId: any;
  toggleMenu(_t92: GopYItem) {
    throw new Error('Method not implemented.');
  }
  // Filter properties
  searchText: string = '';
  selectedType: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';

  filteredFeedbacks: GopYItem[] = [];
  totalItems: number = 0;

  constructor(
    private gopYService: GopYService,
    private loadingService: LoadingService // Giả định bạn có loading service
  ) { }

  // Khởi tạo params mặc định
  queryParams: GopYRequest = {
    pageNumber: 1,
    pageSize: 20,
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
          this.totalItems = res.data.totalItems;
        }
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách góp ý:', err);
        this.loadingService.hide();
      }
    });
  }
}