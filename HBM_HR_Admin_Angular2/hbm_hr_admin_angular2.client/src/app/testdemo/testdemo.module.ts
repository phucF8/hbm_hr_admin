import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TestdemoComponent } from './testdemo.component';

@NgModule({
  declarations: [TestdemoComponent],
  imports: [BrowserModule],
  bootstrap: [TestdemoComponent]  // 👈 đây là chỗ quyết định
})
export class TestdemoModule { }
