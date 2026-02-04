import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DataWarehouseService } from './services/data-warehouse.service';
import { DataWarehouseItem } from './models/data-warehouse.model';
import { DataWarehouseDetailComponent } from './data-warehouse-detail/data-warehouse-detail.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { PAGINATION_CONFIG } from '@app/constants/api.constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-data-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconButton, MatTooltipModule, PaginationComponent],
  templateUrl: './data-warehouse.component.html',
  styleUrls: ['./data-warehouse.component.css']
})
export class DataWarehouseComponent implements OnInit {
  
  listItem: DataWarehouseItem[] = [];
  openedMenuId: string | null = null;
  showPopup: boolean = false;
  selectAll: boolean = false;
  currentPage: number = 1;
  pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private dataWarehouseService: DataWarehouseService,
    private dialog: MatDialog
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

  loadList() {
    this.dataWarehouseService.getList(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.listItem = data.items;
        this.totalItems = data.totalCount;
        this.totalPages = Math.ceil(data.totalCount / this.pageSize);
        console.log('Loaded data warehouse items:', this.listItem.length);
      },
      error: (error) => {
        console.error('Error loading data warehouse list:', error);
        const errorMessage = this.getErrorMessage(error, 'GET /dwh/etl/job-log/list');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          html: errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  onPageChange($event: number) {
    this.currentPage = $event;
    this.loadList();
  }

  toggleSelectAll() {
    this.listItem.forEach(item => {
      item.selected = this.selectAll;
    });
  }

  toggleMenu(item: any) {
    if (this.openedMenuId === item.id) {
      this.openedMenuId = null;
    } else {
      this.openedMenuId = item.id;
    }
  }

  closeMenu() {
    this.openedMenuId = null;
  }

  view(id: string | number) {
    this.dataWarehouseService.getDetail(id).subscribe({
      next: (data) => {
        console.log('Loaded detail:', data);
        this.dialog.open(DataWarehouseDetailComponent, {
          data: data,
          disableClose: false,
          panelClass: 'data-warehouse-detail-dialog',
          width: '60vw',
          height: '90vh',
          maxWidth: '100vw'
        }).afterClosed().subscribe(result => {
          console.log('Dialog closed');
        });
      },
      error: (error) => {
        console.error('Error loading data warehouse detail:', error);
        const errorMessage = this.getErrorMessage(error, `POST /dwh/etl/job-log/detail`);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải chi tiết',
          html: errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  /**
   * Helper method để format error message rõ ràng cho dev
   * @param error - Error object từ HTTP request
   * @param endpoint - API endpoint bị lỗi
   */
  private getErrorMessage(error: any, endpoint: string): string {
    let errorHtml = `<div style="text-align: left; font-size: 13px;">`;
    
    errorHtml += `<p><strong>API:</strong> <code style="background: #f0f0f0; padding: 2px 6px;">${endpoint}</code></p>`;
    
    if (error?.status) {
      errorHtml += `<p><strong>Status Code:</strong> <span style="color: #dc3545;">${error.status}</span></p>`;
    }
    
    if (error?.error?.message) {
      errorHtml += `<p><strong>Message:</strong> ${error.error.message}</p>`;
    } else if (error?.message) {
      errorHtml += `<p><strong>Message:</strong> ${error.message}</p>`;
    }
    
    if (error?.error?.errors) {
      errorHtml += `<p><strong>Chi tiết:</strong><br/>`;
      if (typeof error.error.errors === 'object') {
        Object.entries(error.error.errors).forEach(([key, value]: any) => {
          errorHtml += `• ${key}: ${Array.isArray(value) ? value.join(', ') : value}<br/>`;
        });
      } else {
        errorHtml += error.error.errors;
      }
      errorHtml += `</p>`;
    }
    
    if (error?.statusText) {
      errorHtml += `<p><strong>Status:</strong> ${error.statusText}</p>`;
    }
    
    // Thêm thông tin URL nếu có
    if (error?.url) {
      errorHtml += `<p style="font-size: 11px; color: #666;"><strong>URL:</strong> ${error.url}</p>`;
    }
    
    errorHtml += `<p style="font-size: 11px; color: #999; margin-top: 10px;">💡 Mở DevTools (F12) &gt; Console để xem chi tiết đầy đủ</p>`;
    
    errorHtml += `</div>`;
    
    return errorHtml;
  }
}
