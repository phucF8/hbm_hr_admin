import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { DebugUtils } from '@app/utils/debug-utils';

@Component({
  selector: 'app-advanced-search',
  standalone: false,
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css']
})
export class AdvancedSearchComponent{

  @Output() closePopupEvent = new EventEmitter<{
    response: boolean;
  }>();
  
  @Output() searchPopupEvent = new EventEmitter<{
    ngayTaoTu?: string;
    ngayTaoDen?: string;
    ngayGuiTu?: string;
    ngayGuiDen?: string;
    trangThai?: number | null;
    notificationType?: number | null; // null: tất cả, 1: tự động, 2: chủ động
    loaiThongBao?: string | null;
  }>();

  // Biến lọc thông báo
  ngayTaoTu?: string;
  ngayTaoDen?: string;
  ngayGuiTu?: string;
  ngayGuiDen?: string;
  trangThai?: number | null = null;
  notificationType?: number | null = null; // null: tất cả, 1: tự động, 2: chủ động
  loaiThongBao?: string | null = null;

  constructor() {
    console.log('AdvancedSearchComponent initialized');
    
  }

  closePopup(): void {
    this.closePopupEvent.emit({
      response: false,
    }); // Phát sự kiện để thông báo cho ThongBaoComponent
  }

  // Phương thức tìm kiếm
  timKiem() {
    this.searchPopupEvent.emit({
      ngayTaoTu: this.ngayTaoTu,
      ngayTaoDen: this.ngayTaoDen,
      ngayGuiTu: this.ngayGuiTu,
      ngayGuiDen: this.ngayGuiDen,
      trangThai: this.trangThai,
      notificationType: this.notificationType,
      loaiThongBao: this.loaiThongBao,
    });


    // if (this.thongBaoComponent) {
    //   this.thongBaoComponent.loadListThongBao(
    //     this.ngayTaoTu,
    //     this.ngayTaoDen,
    //     this.ngayGuiTu,
    //     this.ngayGuiDen,
    //     this.trangThai
    //   );
    //   console.log('AdvancedSearchComponent: timKiem called with', {
    //     ngayTaoTu: this.ngayTaoTu,
    //     ngayTaoDen: this.ngayTaoDen,
    //     ngayGuiTu: this.ngayGuiTu,
    //     ngayGuiDen: this.ngayGuiDen,
    //     trangThai: this.trangThai
    //   });
    //   this.closePopup(); // Đóng popup sau khi tìm kiếm
    // } else {
    //   console.error('ThongBaoComponent is not available');
    // }
  }
}
