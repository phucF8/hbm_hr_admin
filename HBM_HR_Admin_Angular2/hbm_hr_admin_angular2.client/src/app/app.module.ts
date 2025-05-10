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
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ToastTestComponent } from './toast-test/toast-test.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { XuatFileComponent } from './components/xuat-file/xuat-file.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { TimkiemComponent } from './uicomponents/timkiem/timkiem.component';
import { InputFormComponent } from './uicomponents/input-form/input-form.component';
import { FromToDateFormComponent } from './uicomponents/from-to-date-form/from-to-date-form.component';
import { OneSelectFormComponent } from './uicomponents/one-select-form/one-select-form.component';
import { SearchUserFormComponent } from './uicomponents/search-user-form/search-user-form.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ThongBaoComponent,
    PaginationComponent,
    TbchitietComponent,
    AdvancedSearchComponent,
    ToastTestComponent,
    XuatFileComponent,
    TimkiemComponent,
    InputFormComponent,
    FromToDateFormComponent,
    OneSelectFormComponent,
    SearchUserFormComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule, // bắt buộc
    ToastrModule.forRoot({
      positionClass: 'toast-top-right'  // 👈 Thêm dòng này
    }),
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
