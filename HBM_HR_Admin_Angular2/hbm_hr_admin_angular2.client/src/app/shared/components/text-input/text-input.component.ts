import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: false,
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css','./../../styles/shared.css']
})
export class TextInputComponent {
  @Input() 
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() control!: FormControl; // 👈 nhận FormControl từ bên ngoài

  constructor(@Optional() private controlContainer: ControlContainer) {}

  // get control(): FormControl {
  //   return this.controlContainer?.control?.get(this.formControlName) as FormControl;
  // }

  /** ✅ Tự động phát hiện nếu control có validator required */
  get isRequired(): boolean {
    const validator = this.control?.validator;
    if (!validator) return false;
    const test = validator(new FormControl());
    return !!(test && test['required']);
  }
}
