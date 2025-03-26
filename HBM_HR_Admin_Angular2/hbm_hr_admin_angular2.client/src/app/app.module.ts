import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TaoThongBaoComponent } from './components/thong-bao/tao-thong-bao/tao-thong-bao.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ThongBaoComponent,
    TaoThongBaoComponent
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
