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

  constructor(private thongBaoService: ThongBaoService) {}

  ngOnInit(): void {
    this.thongBaoService.getThongBao().subscribe(data => {
      this.thongBaoList = data;
    });
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
