import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { QuestionService } from './question.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Question, QuestionDto, QuestionType, QuestionViewModel } from '@app/voting/voting-list/responses/topic-detail.model';
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
 @Input() questions: QuestionViewModel[] = [];
 @Output() questionsChange = new EventEmitter<QuestionViewModel[]>();

  updateSomething() {
    // Sau khi bạn thay đổi questions trong component con
    this.questionsChange.emit(this.questions);  // Emit ra ngoài
  }

  [x: string]: any;
  
  private destroy$ = new Subject<void>();

  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    this.questionService.initializeQuestions(this.questions);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addQuestion(): void {
    this.questionService.addQuestion();
    this.updateSomething();
  }

  deleteQuestion(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      this.questionService.deleteQuestion(id);
      this.updateSomething();
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  dropOption(event: CdkDragDrop<any[]>, questionId: string) {
    const question = this.questions.find(q => q.id === questionId);
    if (question && question.options) {
      moveItemInArray(question.options, event.previousIndex, event.currentIndex);
    }
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

  trackByQuestionId(index: number, question: QuestionViewModel): string {
    return question.id;
  }

  trackByOptionId(index: number, option: any): number {
    return option.id;
  }
}