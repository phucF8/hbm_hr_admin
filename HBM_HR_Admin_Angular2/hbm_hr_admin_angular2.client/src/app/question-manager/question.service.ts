import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuestionDto, QuestionType, QuestionViewModel, Option } from '@app/voting/voting-list/responses/topic-detail.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionId = 1;
  private optionId = 1;
  private questionsSubject = new BehaviorSubject<QuestionViewModel []>([]);

  questions$: Observable<QuestionDto[]> = this.questionsSubject.asObservable();

  constructor() {}

  initializeQuestions(questions: QuestionViewModel[]): void {
    this.questionsSubject.next(questions);
  }

  getQuestions(): QuestionViewModel [] {
    return this.questionsSubject.value;
  }

  addQuestion(): void {
    const questions = this.getQuestions();
    const newQuestion: QuestionViewModel = {
      id: crypto.randomUUID(),
      content: 'Câu hỏi mới',
      type: 'MultiChoice',
      options: [],
      collapsed: false
    };

    questions.push(newQuestion);
    this.questionsSubject.next([...questions]);
  }

  deleteQuestion(id: string): void {
    const questions = this.getQuestions().filter(q => q.id !== id);
    this.questionsSubject.next(questions);
  }

  updateQuestionTitle(id: string, title: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (question) {
      question.content = title;
      this.questionsSubject.next([...questions]);
    }
  }

  updateQuestionType(id: string, type: QuestionType): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (question) {
      question.type = type;
      // Xóa options nếu chuyển sang text
      if (type === 'Essay') {
        question.options = [];
      }
      this.questionsSubject.next([...questions]);
    }
  }

  toggleCollapse(id: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (question) {
      question.collapsed = !question.collapsed;
      this.questionsSubject.next([...questions]);
    }
  }

  addOption(questionId: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOption: Option = {
        id: crypto.randomUUID(), // chuỗi UUID dài 36 ký tự
        content: 'Lựa chọn mới',
        orderNumber: question.options.length + 1 // Gán thứ tự dựa trên độ dài mảng hiện tại
      };
      question.options.push(newOption);
      this.questionsSubject.next([...questions]);
    }
  }


  deleteOption(questionId: string, optionId: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
      question.options = question.options.filter(o => o.id !== optionId);
      this.questionsSubject.next([...questions]);
    }
  }

  updateOption(questionId: string, optionId: string, text: string): void {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const option = question.options.find(o => o.id === optionId);
      if (option) {
        option.content = text;
        this.questionsSubject.next([...questions]);
      }
    }
  }

  getTypeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
      MultiChoice: 'Nhiều lựa chọn',
      SingleChoice: 'Một lựa chọn',
      Essay: 'Tự luận'
    };
    return labels[type] || type;
  }

}