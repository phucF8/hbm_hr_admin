import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-area-input',
  standalone: false,
  templateUrl: './area-input.component.html',
  styleUrls: ['./area-input.component.css','./../../styles/shared.css']
})
export class AreaInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
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
