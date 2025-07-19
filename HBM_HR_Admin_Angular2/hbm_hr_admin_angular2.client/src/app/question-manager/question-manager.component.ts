import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Question, QuestionType } from './question.model';
import { QuestionService } from './question.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-question-manager',
  templateUrl: './question-manager.component.html',
  styleUrls: ['./question-manager.component.css'],
  imports: [
    CommonModule, // 👈 THÊM DÒNG NÀY
    DragDropModule
  ]
})
export class QuestionManagerComponent implements OnInit, OnDestroy {
  [x: string]: any;
  questions: Question[] = [];
  private destroy$ = new Subject<void>();

  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    this.questionService.questions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(questions => {
        this.questions = questions;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addQuestion(): void {
    this.questionService.addQuestion();
  }

  deleteQuestion(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      this.questionService.deleteQuestion(id);
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  updateQuestionTitle(event: Event, questionId: number): void {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      question.title = newValue;
    }
  }

  updateQuestionType(id: number, type: QuestionType): void {
    this.questionService.updateQuestionType(id, type);
  }

  toggleCollapse(id: number): void {
    this.questionService.toggleCollapse(id);
  }

  addOption(questionId: number): void {
    this.questionService.addOption(questionId);
  }

  deleteOption(questionId: number, optionId: number): void {
    this.questionService.deleteOption(questionId, optionId);
  }

  updateOption(event: Event, questionId: number, optionId: number): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;

    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      const option = question.options.find(o => o.id === optionId);
      if (option) {
        option.text = text;
      }
    }
  }


  getTypeLabel(type: QuestionType): string {
    return this.questionService.getTypeLabel(type);
  }

  trackByQuestionId(index: number, question: Question): number {
    return question.id;
  }

  trackByOptionId(index: number, option: any): number {
    return option.id;
  }
}