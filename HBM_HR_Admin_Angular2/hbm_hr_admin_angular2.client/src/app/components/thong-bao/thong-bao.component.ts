import { Component, OnInit } from '@angular/core';
import { ThongBaoService, ThongBao } from '../../services/thong-bao.service';

@Component({
  selector: 'app-thong-bao',
  templateUrl: './thong-bao.component.html',
  styleUrls: ['./thong-bao.component.css'],
  standalone: false,
})
export class ThongBaoComponent implements OnInit {
  thongBaoList: ThongBao[] = [];
  selectAll: boolean = false;
  searchText: string = '';
  selectedType: number = 0; // 0: Tất cả, 1: Thông báo hệ thống, 2: Thông báo cá nhân, 3: Thông báo nhóm

  constructor(private thongBaoService: ThongBaoService) {}

  ngOnInit(): void {
    this.loadThongBao();
  }

  loadThongBao() {
    console.log('Loading notifications with type:', this.selectedType);
    this.thongBaoService.getThongBao(this.selectedType).subscribe({
      next: (data) => {
        console.log('Received notifications:', data);
        this.thongBaoList = data;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  onTypeChange() {
    console.log('Type changed to:', this.selectedType);
    this.loadThongBao();
  }

  sendAgain() {
    alert('Gửi lại thông báo đã chọn!');
  }

  deleteSelected() {
    alert('Xóa những thông báo đã chọn!');
  }

  editThongBao(id: string) {
    alert('Chỉnh sửa thông báo có ID: ' + id);
  }
  
  // Hàm chọn tất cả checkbox
  toggleSelectAll() {
    this.thongBaoList.forEach(tb => tb.selected = this.selectAll);
  }
}
