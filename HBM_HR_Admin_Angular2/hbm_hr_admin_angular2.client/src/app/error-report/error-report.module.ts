import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorReportRoutingModule } from './error-report-routing.module';
import { ErrUserReportDetailPopupComponent } from './error-report-detail/error-report-detail.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ErrUserReportDetailPopupComponent
  ],
  imports: [
    CommonModule,
    ErrorReportRoutingModule,
    FormsModule,
  ],
})
export class ErrorReportModule { }
