import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question, QuestionOption, QuestionType } from './question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionId = 1;
  private optionId = 1;
  private questionsSubject = new BehaviorSubject<Question[]>([]);

  questions$: Observable<Question[]> = this.questionsSubject.asObservable();

  constructor() {}

  getQuestions(): Question[] {
    return this.questionsSubject.value;
  }

  addQuestion(): void {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      id: this.questionId++,
      title: 'Câu hỏi mới',
      type: 'multiple',
      options: [],
      collapsed: false
    };

    questions.push(newQuestion);
    this.questionsSubject.next([...questions]);
  }

  deleteQuestion(id: number): void {
    const questions = this.getQuestions().filter(q => q.id !== id);
    this.questionsSubject.next(questions);
  }

  updateQuestionTitle(id: number, title: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (question) {
      question.title = title;
      this.questionsSubject.next([...questions]);
    }
  }

  updateQuestionType(id: number, type: QuestionType): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (question) {
      question.type = type;
      // Xóa options nếu chuyển sang text
      if (type === 'text') {
        question.options = [];
      }
      this.questionsSubject.next([...questions]);
    }
  }

  toggleCollapse(id: number): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (question) {
      question.collapsed = !question.collapsed;
      this.questionsSubject.next([...questions]);
    }
  }

  addOption(questionId: number): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOption: QuestionOption = {
        id: this.optionId++,
        text: 'Lựa chọn mới'
      };
      question.options.push(newOption);
      this.questionsSubject.next([...questions]);
    }
  }

  deleteOption(questionId: number, optionId: number): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
      question.options = question.options.filter(o => o.id !== optionId);
      this.questionsSubject.next([...questions]);
    }
  }

  updateOption(questionId: number, optionId: number, text: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const option = question.options.find(o => o.id === optionId);
      if (option) {
        option.text = text;
        this.questionsSubject.next([...questions]);
      }
    }
  }

  getTypeLabel(type: QuestionType): string {
    const labels = {
      multiple: 'Nhiều lựa chọn',
      single: 'Một lựa chọn',
      text: 'Văn bản',
      rating: 'Đánh giá'
    };
    return labels[type] || type;
  }
}