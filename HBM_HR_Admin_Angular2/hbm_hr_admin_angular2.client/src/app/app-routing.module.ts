import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'thongbao', component: ThongBaoComponent },
  { path: '**', redirectTo: 'thongbao' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
