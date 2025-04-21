import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-advanced-search',
  standalone: false,
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.css'
})
export class AdvancedSearchComponent {
  @Output() closePopupEvent = new EventEmitter<void>();

  closePopup(): void {
    console.log('AdvancedSearchComponent: closePopup called');
    this.closePopupEvent.emit(); // Phát sự kiện để thông báo cho ThongBaoComponent
  }

}
