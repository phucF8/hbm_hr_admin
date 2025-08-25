// vote-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ErrorService } from '@app/services/error.service';
import { UserAnswerRequest, VotingService } from '@app/services/voting.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface Option {
  id: string;
  content: string;
  votes?: number;
  orderNumber: number;
}

interface Question {
  id: string;
  content: string;
  type: 'MultiChoice' | 'SingleChoice' | 'Essay';
  options?: Option[];
  //required: boolean;
}

interface VoteData {
  questionId: string;
  selectedChoices?: string[];
  textAnswer?: string;
}

@Component({
  selector: 'app-vote-page',
  templateUrl: './vote-page.component.html',
  styleUrls: ['./vote-page.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class VotePageComponent implements OnInit {

  pollTitle: string = '';
  pollDescription: string = '';

  questions: Question[] = [];

  userVotes: { [questionId: string]: VoteData } = {};
  isSubmitting: boolean = false;
  hasSubmitted: boolean = false;

  topicData: any;
  debugAnswers: UserAnswerRequest[] | undefined;
  topicId: string = '';

  constructor(
    private router: Router,
    private errorService: ErrorService, 
    private route: ActivatedRoute,
    private votingService: VotingService,
    private toastr: ToastrService,
  ) { 
    this.topicId = this.route.snapshot.paramMap.get('topicId')!;
  }

  ngOnInit(): void {
    // Initialize user votes object
    this.questions.forEach(question => {
      this.userVotes[question.id] = {
        questionId: question.id,
        selectedChoices: [],
        textAnswer: ''
      };
    });

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


  onChoiceSelect(questionId: string, choiceId: string, isMultiple: boolean = false): void {
    if (!this.userVotes[questionId]) {
      this.userVotes[questionId] = {
        questionId: questionId,
        selectedChoices: [],
        textAnswer: ''
      };
    }

    if (isMultiple) {
      // Multiple choice logic
      const selectedChoices = this.userVotes[questionId].selectedChoices || [];
      const index = selectedChoices.indexOf(choiceId);

      if (index > -1) {
        selectedChoices.splice(index, 1);
      } else {
        selectedChoices.push(choiceId);
      }
    } else {
      // Single choice logic
      this.userVotes[questionId].selectedChoices = [choiceId];
    }
  }

  onTextChange(questionId: string, text: string): void {
    if (!this.userVotes[questionId]) {
      this.userVotes[questionId] = {
        questionId: questionId,
        selectedChoices: [],
        textAnswer: ''
      };
    }
    this.userVotes[questionId].textAnswer = text;
  }

  isChoiceSelected(questionId: string, choiceId: string): boolean {
    const vote = this.userVotes[questionId];
    return vote && vote.selectedChoices ? vote.selectedChoices.includes(choiceId) : false;
  }

  isQuestionAnswered(question: Question): boolean {
    const vote = this.userVotes[question.id];
    if (!vote) return false;

    if (question.type === 'Essay') {
      return !!vote.textAnswer && vote.textAnswer.trim().length > 0;
    } else {
      return !!vote.selectedChoices && vote.selectedChoices.length > 0;
    }
  }

  canSubmit(): boolean {
    // const requiredQuestions = this.questions.filter(q => q.id);
    // return requiredQuestions.every(question => this.isQuestionAnswered(question));
    return true;
  }

  convertUserVotesToAnswers(userVotes: { [questionId: string]: VoteData }): UserAnswerRequest[] {
    const answers: UserAnswerRequest[] = [];
    Object.values(userVotes).forEach(vote => {
      // Nếu có selectedChoices -> mỗi option tạo 1 answer
      if (vote.selectedChoices && vote.selectedChoices.length > 0) {
        vote.selectedChoices.forEach(choiceId => {
          answers.push({
            questionId: vote.questionId,
            optionId: choiceId,
            essayAnswer: vote.textAnswer || ''
          });
        });
      } else {
        // Nếu không có selectedChoices nhưng có textAnswer
        answers.push({
          questionId: vote.questionId,
          essayAnswer: vote.textAnswer || ''
        });
      }
    });

    return answers;
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const answers = this.convertUserVotesToAnswers(this.userVotes);
    this.debugAnswers = answers;
    this.votingService.submitAnswers(answers).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.toastr.success('Phiếu bình chọn của bạn đã được ghi nhận.','Cảm ơn bạn', {
          positionClass: 'toast-top-center',
          timeOut: 5000, // 5s
          progressBar: true
        });
          this.isSubmitting = false;
          this.hasSubmitted = true;
          console.log('✅', res.message);
          this.router.navigate(['/topic-list']);
        } else {
          this.isSubmitting = false;
          this.hasSubmitted = false;
          console.warn('⚠', res.message);
          this.errorService.showError([res.message]);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.hasSubmitted = false;
        this.errorService.showError([err.message]);
      }
    });
  }

  resetForm(): void {
    this.userVotes = {};
    this.hasSubmitted = false;
    this.ngOnInit();
  }

  getProgressPercentage(): number {
    const totalQuestions = this.questions.length;
    const answeredQuestions = this.questions.filter(q => this.isQuestionAnswered(q)).length;
    return (answeredQuestions / totalQuestions) * 100;
  }

  getTextAnswer(questionID: string) {
    if (this.userVotes[questionID]) {
      return this.userVotes[questionID].textAnswer || '';
    }
    return '';
  }

}