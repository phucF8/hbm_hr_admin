import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from './components/text-input/text-input.component';
import { AreaInputComponent } from './components/area-input/area-input.component';
import { DateInputComponent } from './components/date-input/date-input.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TextInputComponent,
    AreaInputComponent,
    DateInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    ReactiveFormsModule, // ✅ Export ra để module khác dùng chung
    TextInputComponent,
    AreaInputComponent,
    DateInputComponent,
  ]
})
export class SharedModule { }
