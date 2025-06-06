import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoRoutingModule } from './demo-routing.module';

import { CompAComponent } from './comp-a/comp-a.component';
import { CompBComponent } from './comp-b/comp-b.component';
import { CompTongComponent } from './comp-tong/comp-tong.component';


@NgModule({
  declarations: [
    CompAComponent,
    CompBComponent,
    CompTongComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    DemoRoutingModule,
    
  ]
})
export class DemoModule { }
