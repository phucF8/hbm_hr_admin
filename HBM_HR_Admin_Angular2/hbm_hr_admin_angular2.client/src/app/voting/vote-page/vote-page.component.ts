// vote-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

interface Choice {
  id: string;
  text: string;
  votes?: number;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'single-choice' | 'text';
  choices?: Choice[];
  required: boolean;
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
  imports:[
    CommonModule,
    ReactiveFormsModule
  ]
})
export class VotePageComponent implements OnInit {
  pollTitle: string = 'Khảo sát ý kiến về sản phẩm mới';
  pollDescription: string = 'Chúng tôi muốn lắng nghe ý kiến của bạn để cải thiện sản phẩm';
  
  questions: Question[] = [
    {
      id: '1',
      text: 'Bạn đánh giá như thế nào về giao diện của ứng dụng?',
      type: 'single-choice',
      required: true,
      choices: [
        { id: '1a', text: 'Rất tốt', votes: 0 },
        { id: '1b', text: 'Tốt', votes: 0 },
        { id: '1c', text: 'Bình thường', votes: 0 },
        { id: '1d', text: 'Không tốt', votes: 0 },
        { id: '1e', text: 'Rất không tốt', votes: 0 }
      ]
    },
    {
      id: '2',
      text: 'Những tính năng nào bạn thấy hữu ích nhất? (Có thể chọn nhiều)',
      type: 'multiple-choice',
      required: true,
      choices: [
        { id: '2a', text: 'Giao diện thân thiện', votes: 0 },
        { id: '2b', text: 'Tốc độ xử lý nhanh', votes: 0 },
        { id: '2c', text: 'Nhiều tùy chọn', votes: 0 },
        { id: '2d', text: 'Dễ sử dụng', votes: 0 },
        { id: '2e', text: 'Tính bảo mật cao', votes: 0 }
      ]
    },
    {
      id: '3',
      text: 'Bạn có góp ý gì khác để chúng tôi cải thiện sản phẩm?',
      type: 'text',
      required: false
    }
  ];

  userVotes: { [questionId: string]: VoteData } = {};
  isSubmitting: boolean = false;
  hasSubmitted: boolean = false;

  ngOnInit(): void {
    // Initialize user votes object
    this.questions.forEach(question => {
      this.userVotes[question.id] = {
        questionId: question.id,
        selectedChoices: [],
        textAnswer: ''
      };
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

    if (question.type === 'text') {
      return !!vote.textAnswer && vote.textAnswer.trim().length > 0;
    } else {
      return !!vote.selectedChoices && vote.selectedChoices.length > 0;
    }
  }

  canSubmit(): boolean {
    const requiredQuestions = this.questions.filter(q => q.required);
    return requiredQuestions.every(question => this.isQuestionAnswered(question));
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Submitted votes:', this.userVotes);
      this.isSubmitting = false;
      this.hasSubmitted = true;
      
      // Show success message for 3 seconds
      setTimeout(() => {
        this.hasSubmitted = false;
      }, 3000);
    }, 1500);
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
}