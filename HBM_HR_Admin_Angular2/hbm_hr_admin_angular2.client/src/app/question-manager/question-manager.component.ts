import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { QuestionService } from './question.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Option, Question, QuestionDto, QuestionType, QuestionViewModel } from '@app/voting/voting-list/responses/topic-detail.model';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-question-manager',
  templateUrl: './question-manager.component.html',
  styleUrls: ['./question-manager.component.css'],
  imports: [
    CommonModule, // 👈 THÊM DÒNG NÀY
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,  // 👈 PHẢI THÊM ReactiveFormsModule
  ]
})
export class QuestionManagerComponent implements OnInit, OnDestroy {
  @Input() parentGroup!: FormGroup; // Input từ component cha
  @Input() formArray!: FormArray; // Input từ component cha
  //@Output() questionsChange = new EventEmitter<QuestionViewModel[]>();


  // updateSomething() {
  //   // Sau khi bạn thay đổi questions trong component con
  //   //this.questionsChange.emit(this.questions);  // Emit ra ngoài
  // }

  [x: string]: any;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private questionService: QuestionService) { }


  ngOnInit(): void {
    console.log('FormArray được truyền vào:', this.formArray);
    console.log('Giá trị hiện tại của FormArray:', this.formArray.value);
    console.log('Số phần tử trong FormArray:', this.formArray.length);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //   createQuestionFormGroup(q: QuestionDto): FormGroup {
  //   return this.fb.group({
  //     id: [q.id],
  //     text: [q.content, Validators.required],
  //     options: this.fb.array(q.options.map(opt => this.createOptionFormGroup(opt)))
  //   });
  // }

  // createOptionFormGroup(opt: OptionDto): FormGroup {
  //   return this.fb.group({
  //     id: [opt.id],
  //     content: [opt.content, Validators.required]
  //   });
  // }

  addQuestion() {
    const questionGroup = this.fb.group({
      content: ['', Validators.required],
      type: ['SingleChoice', Validators.required],
      orderNumber: [0],
      options: this.fb.array([
        this.fb.group({
          content: ['', Validators.required],
          orderNumber: [0]
        })
      ])
    });

    this.formArray.push(questionGroup);
  }

  // addQuestion(): void {
  //   const newQuestion: QuestionViewModel = {
  //     id: crypto.randomUUID(),
  //     content: '',
  //     type: 'SingleChoice',
  //     options: [],
  //     orderNumber: this.questions.length + 1,
  //     collapsed: false
  //   };
  //   this.questions.push(newQuestion);
  //   this.updateSomething();
  // }

  removeQuestion(index: number) {
    this.formArray.removeAt(index);
  }

  // deleteQuestion(id: string): void {
  //   if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
  //     this.questions = this.questions.filter(q => q.id !== id);
  //     this.updateSomething();
  //   }
  // }

  drop(event: CdkDragDrop<any[]>) {
    const controls = this.formArray.controls;
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    controls.forEach((control, index) => {
      control.get('orderNumber')?.setValue(index + 1);
    });
    //this.updateSomething();
  }

  // dropOption(event: CdkDragDrop<any[]>, questionId: string) {
  //   const question = this.questions.find(q => q.id === questionId);
  //   if (question && question.options) {
  //     moveItemInArray(question.options, event.previousIndex, event.currentIndex); // Gán lại orderNumber theo vị trí mới
  //     question.options.forEach((option, index) => {
  //       option.orderNumber = index + 1; // bắt đầu từ 1
  //     });
  //     this.updateSomething();
  //   }
  // }

  // dropOption(event: CdkDragDrop<any[]>, questionIndex: number): void {
  //   const questionGroup = this.formArray.at(questionIndex) as FormGroup;
  //   const options = questionGroup.get('options') as FormArray;
  //   if (options && options.length > 0) {
  //     moveItemInArray(options.controls, event.previousIndex, event.currentIndex);
  //     // Cập nhật lại orderNumber
  //     options.controls.forEach((control, index) => {
  //       control.get('orderNumber')?.setValue(index + 1); // bắt đầu từ 1
  //     });
  //     // this.updateSomething(); // Gọi xử lý cập nhật lại nếu cần
  //   }
  // }

  dropOption(event: CdkDragDrop<AbstractControl[]>, questionIndex: number): void {
    const questionGroup = this.formArray.at(questionIndex) as FormGroup;
    const options = questionGroup.get('options') as FormArray;

    if (options && options.length > 0) {
      moveItemInArray(options.controls, event.previousIndex, event.currentIndex);
      options.controls.forEach((control, index) => {
        control.get('orderNumber')?.setValue(index + 1); // Bắt đầu từ 1
      });
    }
  }



  trackByQuestionId(index: number, control: AbstractControl): string {
    return control.value.id; // hoặc Number nếu id là số
  }

  trackByOptionIndex(index: number, control: AbstractControl): string {
    return control.value.id; // hoặc Number(control.value.id) nếu id là số
  }

  // updateQuestionTitle(event: Event, questionId: string): void {
  //   const input = event.target as HTMLInputElement;
  //   const newValue = input.value;
  //   const question = this.questions.find(q => q.id === questionId);
  //   if (question) {
  //     question.content = newValue;
  //     this.updateSomething();
  //   }
  // }

  // updateQuestionType(id: string, type: QuestionType): void {
  //   this.questionService.updateQuestionType(id, type);
  //   this.updateSomething();
  // }

  toggleCollapse(index: number): void {
    const control = this.formArray.at(index);
    const currentValue = control.get('collapsed')?.value;
    control.get('collapsed')?.setValue(!currentValue);
  }

  addOption(questionIndex: number): void {
    const questionGroup = this.formArray.at(questionIndex) as FormGroup;
    const optionsArray = questionGroup.get('options') as FormArray;
    const newOption = this.fb.group({
      id: this.fb.control(this.generateUUID()), // hoặc '' nếu bạn không cần id
      content: this.fb.control(''),
      isCorrect: this.fb.control(false),
      orderNumber: this.fb.control(optionsArray.length)  // <-- thêm thứ tự
    });

    optionsArray.push(newOption);
  }

  getOptions(question: AbstractControl): FormArray {
    return question.get('options') as FormArray;
  }

  generateUUID(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // addOption(questionId: string): void {
  //   this.questionService.addOption(questionId);
  //   this.updateSomething();
  // }

  deleteOption(questionIndex: number, optionIndex: number): void {
    const question = this.formArray.at(questionIndex) as FormGroup;
    const optionsFormArray = question.get('options') as FormArray;
    console.log('Trước khi xoá:', optionsFormArray.controls.map(ctrl => ctrl.value.content));
    if (optionIndex >= 0 && optionIndex < optionsFormArray.length) {
      optionsFormArray.controls.forEach((ctrl, idx) => {
        ctrl.get('orderNumber')?.setValue(idx + 1);
      });


      optionsFormArray.removeAt(optionIndex);
      optionsFormArray.controls.forEach((ctrl, idx) => {
        ctrl.get('orderNumber')?.setValue(idx + 1);
      });
    }
    // Log ra toàn bộ danh sách options sau khi xoá
    console.log('Sau khi xoá:', optionsFormArray.controls.map(ctrl => ctrl.value.content));
  }

  getControlType(control: AbstractControl): string {
    if (control instanceof FormGroup) return 'FormGroup';
    if (control instanceof FormArray) return 'FormArray';
    if (control instanceof FormControl) return 'FormControl';
    return 'Unknown';
  }




  // updateOption(event: Event, questionId: string, optionId: string): void {
  //   const input = event.target as HTMLInputElement;
  //   const text = input.value;
  //   const question = this.questions.find(q => q.id === questionId);
  //   if (question) {
  //     const option = question.options.find(o => o.id === optionId);
  //     if (option) {
  //       option.content = text;
  //       this.updateSomething();
  //     }
  //   }
  // }

  getTypeLabel(type: QuestionType): string {
    return this.questionService.getTypeLabel(type);
  }


}