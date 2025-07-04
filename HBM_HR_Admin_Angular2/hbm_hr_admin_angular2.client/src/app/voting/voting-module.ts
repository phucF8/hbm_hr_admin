import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VotingRoutingModule } from './voting-routing-module';
import { VotingList } from './voting-list/voting-list';


@NgModule({
  declarations: [
    VotingList
  ],
  imports: [
    CommonModule,
    VotingRoutingModule
  ]
})
export class VotingModule { }
