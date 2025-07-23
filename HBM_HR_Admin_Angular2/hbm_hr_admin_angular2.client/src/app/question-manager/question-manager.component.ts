import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { QuestionService } from './question.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Option, Question, QuestionDto, QuestionType, QuestionViewModel } from '@app/voting/voting-list/responses/topic-detail.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-question-manager',
  templateUrl: './question-manager.component.html',
  styleUrls: ['./question-manager.component.css'],
  imports: [
    CommonModule, // 👈 THÊM DÒNG NÀY
    DragDropModule,
    FormsModule
  ]
})
export class QuestionManagerComponent implements OnInit, OnDestroy {
  @Input() inputQuestions: QuestionViewModel[] = [];
  @Output() questionsChange = new EventEmitter<QuestionViewModel[]>();

  questions: QuestionViewModel[] = [];

  updateSomething() {
    // Sau khi bạn thay đổi questions trong component con
    this.questionsChange.emit(this.questions);  // Emit ra ngoài
  }

  [x: string]: any;

  private destroy$ = new Subject<void>();

  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    this.questions = JSON.parse(JSON.stringify(this.inputQuestions));
    this.questionService.initializeQuestions(this.questions);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addQuestion(): void {
    const newQuestion: QuestionViewModel = {
      id: crypto.randomUUID(),
      content: '',
      type: 'SingleChoice',
      options: [],
      orderNumber: this.questions.length + 1,
      collapsed: false
    };
    this.questions.push(newQuestion);
    this.updateSomething();
  }

  deleteQuestion(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      this.questions = this.questions.filter(q => q.id !== id);
      this.updateSomething();
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex); // Cập nhật lại thứ tự
    this.questions.forEach((item, index) => {
      item.orderNumber = index + 1;
    });
    this.updateSomething();
  }

  dropOption(event: CdkDragDrop<any[]>, questionId: string) {
    const question = this.questions.find(q => q.id === questionId);
    if (question && question.options) {
      moveItemInArray(question.options, event.previousIndex, event.currentIndex); // Gán lại orderNumber theo vị trí mới
      question.options.forEach((option, index) => {
        option.orderNumber = index + 1; // bắt đầu từ 1
      });
      this.updateSomething();
    }
  }

  trackByQuestionId(index: number, question: QuestionViewModel): string {
    return question.id;
  }

  trackByOptionId(index: number, option: Option): string {
    return option.id;
  }

  updateQuestionTitle(event: Event, questionId: string): void {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      question.content = newValue;
      this.updateSomething();
    }
  }

  updateQuestionType(id: string, type: QuestionType): void {
    this.questionService.updateQuestionType(id, type);
    this.updateSomething();
  }

  toggleCollapse(id: string): void {
    this.questionService.toggleCollapse(id);
  }

  addOption(questionId: string): void {
    this.questionService.addOption(questionId);
    this.updateSomething();
  }

  deleteOption(questionId: string, optionId: string): void {
    this.questionService.deleteOption(questionId, optionId);
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      question.options = question.options.filter(o => o.id !== optionId);
    }
    this.updateSomething();
  }

  updateOption(event: Event, questionId: string, optionId: string): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      const option = question.options.find(o => o.id === optionId);
      if (option) {
        option.content = text;
        this.updateSomething();
      }
    }
  }

  getTypeLabel(type: QuestionType): string {
    return this.questionService.getTypeLabel(type);
  }


}