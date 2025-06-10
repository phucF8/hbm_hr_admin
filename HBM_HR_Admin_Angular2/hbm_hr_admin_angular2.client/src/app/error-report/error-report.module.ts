import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorReportRoutingModule } from './error-report-routing.module';
import { ErrUserReportDetailPopupComponent } from './error-report-detail/error-report-detail.component';
import { FormsModule } from '@angular/forms';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';


@NgModule({
  declarations: [
    ErrUserReportDetailPopupComponent
  ],
  imports: [
    CommonModule,
    ErrorReportRoutingModule,
    FormsModule,
    HighlightModule,
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          json: () => import('highlight.js/lib/languages/json'),
        }
      }
    }
  ]
})
export class ErrorReportModule { }
