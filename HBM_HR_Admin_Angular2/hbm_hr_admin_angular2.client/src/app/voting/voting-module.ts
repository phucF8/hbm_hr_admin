import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VotingRoutingModule } from './voting-routing-module';
import { VotingList } from './voting-list/voting-list';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    VotingList
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    VotingRoutingModule,
    FormsModule
  ]
})
export class VotingModule { }
