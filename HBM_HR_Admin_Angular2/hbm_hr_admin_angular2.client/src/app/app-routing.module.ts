import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TaoThongBaoComponent } from './components/thong-bao/tao-thong-bao/tao-thong-bao.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'thongbao', component: ThongBaoComponent },
  { path: 'thong-bao/tao-moi', component: TaoThongBaoComponent },
  { path: '**', redirectTo: 'thongbao' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
