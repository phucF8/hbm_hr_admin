import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { QuillModule } from 'ngx-quill';
import { AuthInterceptor } from './guards/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SearchUserFormComponent } from './uicomponents/search-user-form/search-user-form.component';

@NgModule({
  declarations: [

  ],
  imports: [
    QuillModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule, // bắt buộc
    ToastrModule.forRoot({
      positionClass: 'toast-top-right' // 👈 Thêm dòng này
    }),
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    SearchUserFormComponent,
  ],
  exports: [
    
  ],
  providers: [
    // {provide: LocationStrategy, useClass: HashLocationStrategy},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: []
})
export class AppModule { }
