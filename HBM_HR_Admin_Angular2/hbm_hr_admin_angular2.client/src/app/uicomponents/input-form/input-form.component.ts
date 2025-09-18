import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-form',
  standalone: true,
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.css',
  imports: [
    CommonModule, 
    FormsModule,
  ]
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
