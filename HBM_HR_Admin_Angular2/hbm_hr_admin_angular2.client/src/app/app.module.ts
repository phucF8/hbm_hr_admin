import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { TbchitietComponent } from './components/thong-bao/tbchitiet/tbchitiet.component';
import { TbchitietDialogComponent } from './components/thong-bao/tbchitiet-dialog/tbchitiet-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ThongBaoComponent,
    PaginationComponent,
    TbchitietComponent,
    TbchitietDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
