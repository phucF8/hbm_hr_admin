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
    this.loadTopicForReview();
  }

  loadTopicForReview() {
    this.votingService.getTopicForReview(this.topicId).subscribe({
      next: (data) => {
        this.topicData = data.data;
        this.pollTitle = this.topicData.title;
        this.pollDescription = this.topicData.description;
        this.questions = this.topicData.questions;
      },
      error: (err) => {
        console.error('Lỗi khi load topic:', err);
        this.errorService.showError([JSON.stringify(err)]);
      }
    });
  }

  getTextAnswer(questionId: string): string {
    const question = this.topicData.questions.find((q: any) => q.id === questionId);
    if (!question || !question.userAnswers) return '';
    // Tìm câu trả lời dạng text (essayAnswer khác rỗng)
    const essay = question.userAnswers.find((ans: any) => ans.essayAnswer);
    return essay ? essay.essayAnswer : '';
  }

  isChoiceSelected(questionId: string, choiceId: string): boolean {
    const question = this.topicData.questions.find((q: any) => q.id === questionId);
    if (!question || !question.userAnswers) return false;
    // Kiểm tra có optionId nào trùng với choiceId hay không
    return question.userAnswers.some((ans: any) => ans.optionId === choiceId);
  }



  isQuestionAnswered(question: Question): boolean {
    return true;
  }


}
