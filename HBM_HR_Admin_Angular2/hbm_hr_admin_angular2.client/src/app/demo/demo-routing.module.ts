import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompAComponent } from './comp-a/comp-a.component';
import { CompBComponent } from './comp-b/comp-b.component';
import { CompTongComponent } from './comp-tong/comp-tong.component';

const routes: Routes = [
  { path: 'comp-a', component: CompAComponent },
  { path: 'comp-b', component: CompBComponent },
  { path: '', component: CompTongComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule { }
