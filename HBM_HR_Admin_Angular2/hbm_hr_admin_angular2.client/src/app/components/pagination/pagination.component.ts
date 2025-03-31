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

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(newPage: number) {
    console.log('newPage',newPage);
    //if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    //}
  }
  
}
