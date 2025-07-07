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
  }


  closePopup() {
    this.dialogRef.close();
  }

  onSubmit() {
    // if (!this.notificationId) {
    //   this.onSubmitCreateNew();
    // } else {
    this.onSubmitUpdate();
    // }
  }

  onSubmitUpdate() {
    if (this.myForm.invalid) return;
    const updatedTopic: TopicDetail = {
      ...this.data,
      ...this.myForm.value,
      updatedAt: new Date().toISOString() // gán lại updatedAt nếu cần
    };
    const jsonStr = JSON.stringify(updatedTopic); // null, 2 => để format đẹp

    navigator.clipboard.writeText(jsonStr).then(() => {alert('Đã copy JSON vào clipboard!');}).catch(err => {});

    this.service.updateTopic(updatedTopic).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          alert('Cập nhật thành công!');
        } else {
          alert('Cập nhật thất bại: ' + res.message);
        }
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }

}
