import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuestionDto, QuestionViewModel, TopicDetail } from '../voting-list/responses/topic-detail.model';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, formatDate } from '@angular/common';
import { mapToDto } from '@app/utils/question.mapper';
import { QuestionManagerComponent } from '@app/question-manager/question-manager.component';
import { TextInputComponent } from '@app/shared/components/text-input/text-input.component';
import { AreaInputComponent } from '@app/shared/components/area-input/area-input.component';
import { DateInputComponent } from '@app/shared/components/date-input/date-input.component';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';


@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuestionManagerComponent,
  ],
  templateUrl: './topic-detail.component.html',
  styleUrl: './topic-detail.component.css',
})
export class TopicDetailComponent implements OnInit {

  myForm!: FormGroup;
  loadedQuestions: QuestionDto[] = []; // dữ liệu sẽ được load từ API
  questionsArray!: FormArray; // để tiện dùng trong HTML

  ngOnInit(): void {

  }

  constructor(
    // private toastr: ToastrService,
    private service: VotingListService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TopicDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TopicDetail
  ) {
    this.myForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: [null],
      endDate: [null],
      questions: this.fb.array([])
    });
    this.questionsArray = this.myForm.get('questions') as FormArray;

    if (data) {
      this.myForm.patchValue({
        title: data.title || '',
        description: data.description || '',
        startDate: data.startDate ? formatDate(data.startDate, 'yyyy-MM-dd', 'en') : null,
        endDate: data.endDate ? formatDate(data.endDate, 'yyyy-MM-dd', 'en') : null,
      });
      this.loadedQuestions = data.questions || [];
      this.loadedQuestions.forEach(q => {
        this.questionsArray.push(this.createQuestionFormGroup(q));
      });
    }
  }

  private createQuestionFormGroup(q: QuestionDto): FormGroup {
    const optionsArray = this.fb.array<FormGroup>([]);
    (q.options || []).forEach(opt => {
      optionsArray.push(this.fb.group({
        id: [opt.id],
        content: [opt.content, Validators.required],
        orderNumber: [opt.orderNumber ?? 0],
      }));
    });

    return this.fb.group({
      id: [q.id],
      content: [q.content, Validators.required],
      type: [q.type || 'SingleChoice', Validators.required],
      orderNumber: [q.orderNumber ?? 0],
      options: optionsArray,
      collapsed: false,
    });
  }


  mapToViewModel(dto: QuestionDto): QuestionViewModel {
    return {
      ...dto,
      collapsed: false
    };
  }

  mapToViewModels(dtos: QuestionDto[]): QuestionViewModel[] {
    return dtos.map(q => ({
      ...q,
      collapsed: false
    }));
  }

  // getter tiện dùng trong HTML
  get questionsFormArray(): FormArray {
    return this.myForm.get('questions') as FormArray;
  }

  addQuestion() {
    this.questionsFormArray.push(this.fb.group({
      id: [window.crypto.randomUUID()], // hoặc null nếu để backend xử lý
      content: ['', Validators.required],
      type: ['SingleChoice', Validators.required],
      orderNumber: [this.questionsFormArray.length + 1]
    }));
  }

  removeQuestion(index: number) {
    this.questionsFormArray.removeAt(index);
  }

  getFormControl(name: string): FormControl {
    return this.myForm.get(name) as FormControl;
  }

  getOptionsFormArray(questionIndex: number): FormArray {
    return this.questionsFormArray.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number) {
    const options = this.getOptionsFormArray(questionIndex);
    options.push(
      this.fb.group({
        id: [window.crypto.randomUUID()], // hoặc null nếu để backend xử lý
        content: ['', Validators.required],
        orderNumber: [options.length + 1]
      })
    );
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptionsFormArray(questionIndex);
    options.removeAt(optionIndex);
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      content: ['', Validators.required],
      type: ['SingleChoice', Validators.required],
      options: this.fb.array([
        this.createOptionForm()
      ])
    });
  }

  createOptionForm(): FormGroup {
    return this.fb.group({
      content: ['', Validators.required]
    });
  }

  onQuestionsChange(updatedQuestions: QuestionViewModel[]) {
    this.data.questions = mapToDto(updatedQuestions);
    const questionsFormArray = this.fb.array(
      this.data.questions.map(q => this.createQuestionFormGroup(q))
    );
    this.myForm.setControl('questions', questionsFormArray);
  }

  closePopup() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.myForm.invalid) {
      this.logFormValidationErrors(this.myForm);
      return;
    }

    if (!this.data?.id) {
      this.onSubmitCreate();
    } else {
      this.onSubmitUpdate();
    }
  }

  private logFormValidationErrors(control: AbstractControl, path: string = ''): boolean {
    if (control instanceof FormGroup || control instanceof FormArray) {
      const group = control as FormGroup | FormArray;

      for (const key of Object.keys(group.controls)) {
        const childControl = group.get(key);
        const newPath = path ? `${path}.${key}` : key;
        if (childControl) {
          const hasError = this.logFormValidationErrors(childControl, newPath);
          if (hasError) return true; // ⛔ Dừng ngay khi gặp lỗi đầu tiên
        }
      }

      if (control.invalid && !control.errors) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi nhập liệu',
          html: `❌ Trường "${path}" không hợp lệ do một control con sai.`,
          confirmButtonText: 'Đóng'
        });
        return true; // ⛔ Dừng tại đây
      }
    } else {
      if (control.invalid) {
        const firstErrorKey = Object.keys(control.errors!)[0];
        const errorMessage = this.getErrorMessage(firstErrorKey, control.errors![firstErrorKey]);

        Swal.fire({
          icon: 'error',
          title: 'Lỗi nhập liệu',
          html: `❌ Trường "${path}" lỗi: ${errorMessage}`,
          confirmButtonText: 'Đóng'
        });
        return true; // ⛔ Dừng tại đây
      }
    }

    return false; // ✅ Không có lỗi ở nhánh này
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required':
        return 'Trường này là bắt buộc.';
      case 'minlength':
        return `Độ dài tối thiểu là ${errorValue.requiredLength} ký tự.`;
      case 'maxlength':
        return `Độ dài tối đa là ${errorValue.requiredLength} ký tự.`;
      case 'pattern':
        return `Không đúng định dạng.`;
      default:
        return `Lỗi không xác định (${errorKey}).`;
    }
  }

  onSubmitUpdate() {
    const idUser = localStorage.getItem('id')
    // Xử lý giá trị rỗng thành null
    const formValue = this.myForm.value;
    if (formValue.startDate === '') {
      formValue.startDate = null;
    }
    if (formValue.endDate === '') {
      formValue.endDate = null;
    }
    const updatedTopic: TopicDetail = {
      ...this.data,
      ...this.myForm.value,
      updatedAt: new Date().toISOString(), // gán lại updatedAt nếu cần
      updatedBy: idUser,
    };
    // updatedTopic.questions = this.data.questions;
    const jsonStr = JSON.stringify(updatedTopic); // null, 2 => để format đẹp

    // if (!environment.production) {
    //   navigator.clipboard.writeText(jsonStr).then(() => { this.toastr.info('Đã copy to clipboard') }).catch(err => { });
    // }

    this.service.updateTopic(updatedTopic).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          // this.toastr.success('Cập nhật thành công!', ``, {
          //   positionClass: 'toast-top-right'
          // });
          this.dialogRef.close(res);
        } else {
          // this.toastr.error('ERROR', 'Cập nhật thất bại: ' + res.message, {
          //   positionClass: 'toast-top-right'
          // });
        }
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ||  // nếu backend trả về { message: '...' }
          err?.message ||         // nếu là lỗi từ HttpClient
          'Đã xảy ra lỗi không xác định';
        alert('Lỗi tạo chủ đề: ' + errorMsg);
      }
    });
  }

  onSubmitCreate() {
    const idUser = localStorage.getItem('id')
    const newTopic: TopicDetail = {
      ...this.myForm.value,
      createdAt: new Date().toISOString(), // hoặc để backend xử lý
      updatedAt: new Date().toISOString(),  // nếu cần
      createdBy: idUser,
    };

    const jsonStr = JSON.stringify(newTopic, null, 2); // format JSON đẹp
    console.log(jsonStr);
    // if (!environment.production) {
    // navigator.clipboard.writeText(jsonStr).then(() => {
    //   alert('Đã copy JSON vào clipboard!');
    // }).catch(err => { });
    // }

    this.service.createTopic(newTopic).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          alert('Tạo chủ đề thành công!');
          this.dialogRef.close(newTopic);
        } else {
          alert('Tạo thất bại: ' + res.message);
        }
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ||  // nếu backend trả về { message: '...' }
          err?.message ||         // nếu là lỗi từ HttpClient
          'Đã xảy ra lỗi không xác định';
        alert('Lỗi tạo chủ đề: ' + errorMsg);
      }

    });
  }

  get titleControl(): FormControl {
    return this.myForm.get('title') as FormControl;
  }

}
