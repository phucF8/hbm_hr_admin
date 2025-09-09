import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ThongBaoComponent } from './components/thong-bao/thong-bao.component';
import { TbchitietComponent } from './components/thong-bao/tbchitiet/tbchitiet.component';
import { AuthGuard } from './guards/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './admin/admin.component';
import { UserDetailComponent } from './admin/user-detail/user-detail.component';
import { VotePageComponent } from './voting/vote-page/vote-page.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { TopicListComponent } from './voting/topic-list/topic-list.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { SurveyReviewComponent } from './survey/survey-review/survey-review.component';
import { SurveyDetailReportComponent } from './survey/survey-detail-report/survey-detail-report.component';

const routes: Routes = [
  {
    path: 'admin',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'thongbao', pathMatch: 'full' },
      { path: 'thongbao', component: ThongBaoComponent, canActivate: [AuthGuard] },
      { path: 'survey-detail-report/:topicId', component: SurveyDetailReportComponent, canActivate: [AuthGuard] },
      { path: 'admin', component: AdminComponent},
      {
        path: 'voting',
        loadChildren: () => import('./voting/voting-module').then(m => m.VotingModule)
      },
      {
        path: 'error-report',
        loadChildren: () => import('./error-report/error-report.module').then(m => m.ErrorReportModule)
      },
      // thêm các routes khác ở đây
    ]
  },

  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'topic-list', pathMatch: 'full' },
      { path: 'topic-list', component: TopicListComponent },
      { path: 'voting/:topicId', component: VotePageComponent },
      { path: 'survey-review/:topicId', component: SurveyReviewComponent },
    ],
    canActivate: [AuthGuard]
  },

  {
    path: 'question-manager',
    loadComponent: () => import('./question-manager/question-manager.component').then(m => m.QuestionManagerComponent)
  },

  {
    path: 'demo',
    loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule)
  },

  { path: 'user-detail', component: UserDetailComponent },

  { path: 'login', component: LoginComponent },

  { path: 'thong-bao/tbchitiet', component: TbchitietComponent },
  { path: 'thong-bao/tbchitiet/:id', component: TbchitietComponent },

  { path: '**', component: NotFoundComponent }  // 👈 Thay vì redirect

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
