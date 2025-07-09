import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VotingRoutingModule } from './voting-routing-module';
import { VotingList } from './voting-list/voting-list';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [
    VotingList 
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    VotingRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class VotingModule { }
