import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TbchitietComponent } from './components/thong-bao/tbchitiet/tbchitiet.component';
import { AuthGuard } from './guards/auth.guard';
import { ErrorUserReportComponent } from './components/error-user-report/error-user-report.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: 'demo', loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule)
  },

  { path: 'login', component: LoginComponent },
  { path: 'thongbao', component: ThongBaoComponent, canActivate: [AuthGuard] },
  
  { path: 'thong-bao/tbchitiet', component: TbchitietComponent },
  { path: 'thong-bao/tbchitiet/:id', component: TbchitietComponent },

  { path: 'error-user-report', component: ErrorUserReportComponent }, // 👈 chuyển lên trên

  { path: '', redirectTo: 'thongbao', pathMatch: 'full' },
  
   { path: '**', component: NotFoundComponent }  // 👈 Thay vì redirect
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
