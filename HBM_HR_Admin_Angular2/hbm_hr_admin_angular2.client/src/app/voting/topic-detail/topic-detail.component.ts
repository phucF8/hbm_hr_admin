import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuestionDto, TopicDetail } from '../voting-list/responses/topic-detail.model';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-topic-detail',
  standalone: false,
  templateUrl: './topic-detail.component.html',
  styleUrl: './topic-detail.component.css'
})
export class TopicDetailComponent implements OnInit {

  myForm!: FormGroup;
  questions: QuestionDto[] = []; // dữ liệu sẽ được load từ API
  questionsArray!: FormArray; // để tiện dùng trong HTML

  ngOnInit(): void {
    
  }

  constructor(
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef,
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
      questions: this.fb.array([]) // ✅ thêm vào đây
    });
    if (data) {
        this.myForm.patchValue({
          title: data.title || '',
          description: data.description || '',
          startDate: data.startDate ? formatDate(data.startDate, 'yyyy-MM-dd', 'en') : null,
          endDate: data.endDate ? formatDate(data.endDate, 'yyyy-MM-dd', 'en') : null,
        });
        this.questions = data.questions || [];
        this.questionsArray = this.myForm.get('questions') as FormArray;
        this.questions.forEach(q => {
        this.questionsArray.push(this.fb.group({
          id: [q.id],
          content: [q.content, Validators.required],
          type: [q.type || 'SingleChoice', Validators.required],
          orderNumber: [q.orderNumber ?? 0]
        }));
      });
    }
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

  closePopup() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.myForm.invalid) return;
    if (!this.data?.id) {
      this.onSubmitCreate();
    } else {
      this.onSubmitUpdate();
    }
  }

  onSubmitUpdate() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
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
      updatedBy: currentUser.DataSets.Table[0].ID
    };
    const jsonStr = JSON.stringify(updatedTopic); // null, 2 => để format đẹp

    navigator.clipboard.writeText(jsonStr).then(() => { this.toastr.info('Đã copy to clipboard') }).catch(err => { });

    this.service.updateTopic(updatedTopic).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.toastr.success('Cập nhật thành công!', ``, {
            positionClass: 'toast-top-right'
          });
          this.dialogRef.close(res);
        } else {
          this.toastr.error('ERROR', 'Cập nhật thất bại: ' + res.message, {
            positionClass: 'toast-top-right'
          });
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const newTopic: TopicDetail = {
      ...this.myForm.value,
      createdAt: new Date().toISOString(), // hoặc để backend xử lý
      updatedAt: new Date().toISOString(),  // nếu cần
      createdBy: currentUser.DataSets.Table[0].ID
    };

    const jsonStr = JSON.stringify(newTopic, null, 2); // format JSON đẹp
    navigator.clipboard.writeText(jsonStr).then(() => {
      alert('Đã copy JSON vào clipboard!');
    }).catch(err => { });

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
