import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TaoThongBaoComponent } from './components/thong-bao/tao-thong-bao/tao-thong-bao.component';
import { SuaThongBaoComponent } from './components/thong-bao/sua-thong-bao/sua-thong-bao.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'thongbao', component: ThongBaoComponent },
  { path: 'thong-bao/tao-moi', component: TaoThongBaoComponent },
  { path: 'thong-bao/sua/:id', component: SuaThongBaoComponent },
  { path: '**', redirectTo: 'thongbao' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
