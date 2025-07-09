import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: false,
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = '';
  @Input() formControlName!: string;

  constructor(@Optional() private controlContainer: ControlContainer) {}

  get control(): FormControl {
    return this.controlContainer?.control?.get(this.formControlName) as FormControl;
  }
}
