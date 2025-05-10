import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-from-to-date-form',
  standalone: false,
  templateUrl: './from-to-date-form.component.html',
  styleUrl: './from-to-date-form.component.css'
})
export class FromToDateFormComponent {
  @Input() label: string = 'Thời gian tạo';
  @Input() fromPlaceholder: string = 'Từ ngày';
  @Input() toPlaceholder: string = 'Đến ngày';
  @Input() fromDateId: string = 'from-date';
  @Input() toDateId: string = 'to-date';

  @Input() fromDate?: string = '';
  @Input() toDate?: string = '';

  @Output() fromDateChange = new EventEmitter<string>();
  @Output() toDateChange = new EventEmitter<string>();

  onFromDateChange(value: string) {
    this.fromDate = value;
    this.fromDateChange.emit(this.fromDate);
  }

  onToDateChange(value: string) {
    this.toDate = value;
    this.toDateChange.emit(this.toDate);
  }
}
