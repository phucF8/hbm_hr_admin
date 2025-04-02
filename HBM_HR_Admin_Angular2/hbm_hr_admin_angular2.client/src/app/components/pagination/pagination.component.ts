import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  standalone: false,
})
export class PaginationComponent {
  @Input() totalPages: number = 1;   // Tổng số trang
  @Input() currentPage: number = 1;  // Trang hiện tại
  @Output() pageChange = new EventEmitter<number>(); // Event khi trang thay đổi

  get pages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Số lượng trang hiển thị xung quanh trang hiện tại
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Thêm trang đầu tiên
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...'); // Dấu "..." nếu có khoảng cách
      }
    }

    // Thêm các trang xung quanh trang hiện tại
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Thêm trang cuối cùng
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push('...'); // Dấu "..." nếu có khoảng cách
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  changePage(newPage: number | string) {
    if (newPage === '...') {
      // Không làm gì nếu nhấn vào dấu "..."
      return;
    }

    if (typeof newPage === 'number' && newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage; // Cập nhật trang hiện tại
      this.pageChange.emit(this.currentPage); // Phát sự kiện thay đổi trang
    }
  }
  
}
