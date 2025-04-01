import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TbchitietComponent } from './components/thong-bao/tbchitiet/tbchitiet.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'thongbao', component: ThongBaoComponent, canActivate: [AuthGuard] },
  
 
  { path: 'thong-bao/tbchitiet', component: TbchitietComponent }, //truong hop tao moi thong bao
  { path: 'thong-bao/tbchitiet/:id', component: TbchitietComponent },

  { path: '', redirectTo: 'thongbao', pathMatch: 'full' },
  { path: '**', redirectTo: 'thongbao' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
