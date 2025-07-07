import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TopicDetail } from '../voting-list/responses/topic-detail.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';

@Component({
  selector: 'app-topic-detail',
  standalone: false,
  templateUrl: './topic-detail.component.html',
  styleUrl: './topic-detail.component.css'
})
export class TopicDetailComponent implements OnInit {

  myForm!: FormGroup;

  ngOnInit(): void {

  }

  constructor(
    private service: VotingListService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TopicDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TopicDetail

  ) {
    this.myForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
    if (data) {
      this.myForm.patchValue({
        title: data.title || '',
        description: data.description || ''
      });
    }
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
    const updatedTopic: TopicDetail = {
      ...this.data,
      ...this.myForm.value,
      updatedAt: new Date().toISOString(), // gán lại updatedAt nếu cần
      updatedBy: currentUser.DataSets.Table[0].ID
    };
    const jsonStr = JSON.stringify(updatedTopic); // null, 2 => để format đẹp

    navigator.clipboard.writeText(jsonStr).then(() => {alert('Đã copy JSON vào clipboard!');}).catch(err => {});

    this.service.updateTopic(updatedTopic).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          alert('Cập nhật thành công!');
          this.dialogRef.close(res);
        } else {
          alert('Cập nhật thất bại: ' + res.message);
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
  }).catch(err => {});

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





}
