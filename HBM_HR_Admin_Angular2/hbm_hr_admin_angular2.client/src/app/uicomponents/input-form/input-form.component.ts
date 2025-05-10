import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-form',
  standalone: false,
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css'
})

export class InputFormComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() onEnter = new EventEmitter<string>();

  ngOnChanges() {
    this.valueChange.emit(this.value);
  }

  onValueChange(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(this.value);  // 👈 Phát ra sự kiện để cập nhật
  }

}
