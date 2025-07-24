import { CommonModule } from '@angular/common';
import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-area-input',
  standalone: true,
   imports: [CommonModule, ReactiveFormsModule],  // 👈 PHẢI THÊM ReactiveFormsModule
  templateUrl: './area-input.component.html',
  styleUrls: ['./area-input.component.css','./../../styles/shared.css']
})
export class AreaInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control!: FormControl; // ✅ dùng formControl trực tiếp

  constructor(@Optional() private controlContainer: ControlContainer) {}


  get isRequired(): boolean {
    const validator = this.control?.validator;
    if (!validator) return false;
    const test = validator(new FormControl());
    return !!(test && test['required']);
  }
}
