
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-one-select-form',
  standalone: false,
  templateUrl: './one-select-form.component.html',
  styleUrl: './one-select-form.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OneSelectFormComponent),
      multi: true
    }
  ]
})
export class OneSelectFormComponent implements ControlValueAccessor {

  @Input() label: string = 'Chọn một giá trị';
  @Input() options: Array<{ value: any, label: string }> = [];

  
  value: string | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: string | null): void {
    this.value = val;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
