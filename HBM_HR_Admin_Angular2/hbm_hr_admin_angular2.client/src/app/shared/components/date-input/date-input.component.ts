import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-input',
  standalone: false,
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.css','./../../styles/shared.css']
})
export class DateInputComponent {
  @Input() label: string = '';
  @Input() formControlName!: string;

  constructor(@Optional() private controlContainer: ControlContainer) {}

  get control(): FormControl {
    return this.controlContainer?.control?.get(this.formControlName) as FormControl;
  }

   get isRequired(): boolean {
    const validator = this.control?.validator;
    if (!validator) return false;
    const test = validator(new FormControl());
    return !!(test && test['required']);
  }

}
