// vote-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { VotingService } from '@app/services/voting.service';

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
  imports:[
    CommonModule,
    ReactiveFormsModule
  ]
})
export class VotePageComponent implements OnInit {
  pollTitle: string = '';
  pollDescription: string = '';
  
  questions: Question[] = [
    {
      id: '1',
      content: 'Bạn đánh giá như thế nào về giao diện của ứng dụng?',
      type: 'SingleChoice',
      //required: true,
      options: [
        { id: '1a', content: 'Rất tốt', votes: 0 ,orderNumber: 1},
        { id: '1b', content: 'Tốt', votes: 0 ,orderNumber: 2},
        { id: '1c', content: 'Bình thường', votes: 0,orderNumber: 3 },
        { id: '1d', content: 'Không tốt', votes: 0,orderNumber: 4 },
        { id: '1e', content: 'Rất không tốt', votes: 0,orderNumber: 5 }
      ]
    },
    {
      id: '2',
      content: 'Những tính năng nào bạn thấy hữu ích nhất? (Có thể chọn nhiều)',
      type: 'MultiChoice',
      //required: true,
      options: [
        { id: '1a', content: 'Rất tốt', votes: 0 ,orderNumber: 1},
        { id: '1b', content: 'Tốt', votes: 0 ,orderNumber: 2},
        { id: '1c', content: 'Bình thường', votes: 0,orderNumber: 3 },
        { id: '1d', content: 'Không tốt', votes: 0,orderNumber: 4 },
        { id: '1e', content: 'Rất không tốt', votes: 0,orderNumber: 5 }
      ]
    },
    {
      id: '3',
      content: 'Bạn có góp ý gì khác để chúng tôi cải thiện sản phẩm?',
      type: 'Essay',
      //required: false
    }
  ];

  userVotes: { [questionId: string]: VoteData } = {};
  isSubmitting: boolean = false;
  hasSubmitted: boolean = false;

  topicData: any;

  constructor(private votingService: VotingService) {}

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
    const topicId = '4e08d249-9624-40d5-aeb5-3f55ca19746b'; // ID topic cần lấy
    this.votingService.getVotingTopic(topicId).subscribe({
      next: (data) => {
        this.topicData = data;
        this.pollTitle = data.title;
        this.pollDescription = data.description;
        this.questions = data.questions;
      },
      error: (err) => {
        console.error('Lỗi khi load topic:', err);
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
    //const requiredQuestions = this.questions.filter(q => q.required);
    //return requiredQuestions.every(question => this.isQuestionAnswered(question));
    return true;
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