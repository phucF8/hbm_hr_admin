import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThongBaoService } from '../../../services/thong-bao.service';
import { NOTIFICATION_TYPES } from '../../../constants/notification-types';

@Component({
  selector: 'chitiet-thong-bao',
  templateUrl: './tbchitiet.component.html',
  styleUrls: ['./tbchitiet.component.css'],
  standalone: false,
  
  providers: [ThongBaoService]
})
export class TbchitietComponent implements OnInit {
  thongBaoForm: FormGroup;
  notificationTypes = NOTIFICATION_TYPES;
  isSubmitting = false;
  errorMessage = '';
  notificationId: string = '';

  constructor(
    private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.thongBaoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      notificationType: [1, Validators.required],
      sentAt: ['']
    });
  }

  ngOnInit(): void {
    this.notificationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.notificationId) {
      this.loadNotification();
    }
  }

  loadNotification() {
    this.thongBaoService.getThongBaoByID(this.notificationId).subscribe({
      next: (notification) => {
        if (notification) {
          console.log('notification:', notification);
          console.log('title:', notification.title);
          const formattedDate = notification.sentAt ? notification.sentAt : '';
          console.log('notification.sentAt:', notification.sentAt);
          console.log('Formatted date:', formattedDate);
          this.thongBaoForm.patchValue({
            title: notification.title,
            content: notification.content,
            notificationType: notification.notificationType,
            sentAt: formattedDate
          });
        } else {
          this.errorMessage = 'Không tìm thấy thông báo';
        }
      },
      error: (error) => {
        console.error('Error loading notification:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi tải thông báo';
      }
    });
  }

  onSubmit() {
    console.log('Submit button clicked');
    console.log('Form value:', this.thongBaoForm.value);
    console.log('Form valid:', this.thongBaoForm.valid);
    console.log('notification.sentAt:', this.thongBaoForm.value.sentAt);
    if (this.thongBaoForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formValue = this.thongBaoForm.value;
      const updateRequest = {
        ...formValue,
        id: this.notificationId,
        sentAt: formValue.sentAt ? formValue.sentAt : null
      };
      
      this.thongBaoService.updateThongBao(updateRequest).subscribe({
        next: (response) => {
          console.log('✅ Notification updated successfully:', response);
          alert('Thông báo đã được cập nhật thành công!');
          this.router.navigate(['/thongbao']);
        },
        error: (error) => {
          console.error('❌ Error updating notification:', error);
          this.errorMessage = error.error || 'Đã xảy ra lỗi khi cập nhật thông báo';
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.thongBaoForm.controls).forEach(key => {
        const control = this.thongBaoForm.get(key);
        if (control?.errors) {
          console.error(`${key} errors:`, control.errors);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/thongbao']);
  }
} 