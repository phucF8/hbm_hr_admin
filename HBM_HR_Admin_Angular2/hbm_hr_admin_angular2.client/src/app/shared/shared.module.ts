import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from './components/text-input/text-input.component';
import { AreaInputComponent } from './components/area-input/area-input.component';



@NgModule({
  declarations: [
    TextInputComponent,
    AreaInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    ReactiveFormsModule, // ✅ Export ra để module khác dùng chung
    TextInputComponent,
    AreaInputComponent,
  ]
})
export class SharedModule { }
