import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorUserReportComponent } from './error-user-report/error-user-report.component';

const routes: Routes = [
  { path: '', component: ErrorUserReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorReportRoutingModule { }
