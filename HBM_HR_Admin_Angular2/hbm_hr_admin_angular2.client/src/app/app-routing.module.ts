import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TaoThongBaoComponent } from './components/thong-bao/tao-thong-bao/tao-thong-bao.component';
import { SuaThongBaoComponent } from './components/thong-bao/sua-thong-bao/sua-thong-bao.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'thongbao', component: ThongBaoComponent, canActivate: [AuthGuard] },
  { path: 'thong-bao/tao-moi', component: TaoThongBaoComponent, canActivate: [AuthGuard] },
  { path: 'thong-bao/sua/:id', component: SuaThongBaoComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'thongbao', pathMatch: 'full' },
  { path: '**', redirectTo: 'thongbao' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
