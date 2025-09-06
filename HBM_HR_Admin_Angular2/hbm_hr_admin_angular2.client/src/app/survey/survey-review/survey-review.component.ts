import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '@app/services/error.service';
import { VotingService } from '@app/services/voting.service';
import { Question } from '@app/voting/voting-list/responses/topic-detail.model';

@Component({
  selector: 'app-survey-review',
  templateUrl: './survey-review.component.html',
  styleUrl: './survey-review.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class SurveyReviewComponent {

  topicId: string = '';
  topicData: any;
  pollTitle: string = '';
  pollDescription: string = '';
  questions: Question[] = [];

  constructor(
    private router: Router,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private votingService: VotingService,
  ) {
    this.topicId = this.route.snapshot.paramMap.get('topicId')!;
  }

  ngOnInit(): void {
    this.loadTopic();
  }

  loadTopic() {
    this.votingService.getVotingTopic(this.topicId).subscribe({
      next: (data) => {
        this.topicData = data;
        this.pollTitle = data.title;
        this.pollDescription = data.description;
        this.questions = data.questions;
      },
      error: (err) => {
        console.error('Lỗi khi load topic:', err);
        this.errorService.showError([JSON.stringify(err)]);
      }
    });
  }

  getTextAnswer(questionID: string) {
    // if (this.userVotes[questionID]) {
    //   return this.userVotes[questionID].textAnswer || '';
    // }
    return '';
  }

  isChoiceSelected(questionId: string, choiceId: string): boolean {
    // const vote = this.userVotes[questionId];
    // return vote && vote.selectedChoices ? vote.selectedChoices.includes(choiceId) : false;
    return true;
  }

  isQuestionAnswered(question: Question): boolean {
    return true;
  }


}
