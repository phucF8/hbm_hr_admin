import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotingList } from './voting-list/voting-list';

const routes: Routes = [
  { path: '', component: VotingList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VotingRoutingModule { }
