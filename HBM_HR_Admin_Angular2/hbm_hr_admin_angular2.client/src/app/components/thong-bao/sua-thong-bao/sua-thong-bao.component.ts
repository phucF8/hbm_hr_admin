import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThongBaoService, ThongBao } from '../../../services/thong-bao.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sua-thong-bao',
  templateUrl: './sua-thong-bao.component.html',
  styleUrls: ['./sua-thong-bao.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [ThongBaoService]
})
export class SuaThongBaoComponent implements OnInit {
  thongBaoForm: FormGroup;
  notificationTypes = [
    { id: 1, name: 'Thông báo hệ thống' },
    { id: 2, name: 'Thông báo cá nhân' },
    { id: 3, name: 'Thông báo nhóm' }
  ];
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
    this.thongBaoService.getThongBao().subscribe({
      next: (notifications) => {
        const notification = notifications.find(n => n.id === this.notificationId);
        if (notification) {
          const formattedDate = notification.sentAt ? new Date(notification.sentAt).toISOString().slice(0, 16) : '';
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
    if (this.thongBaoForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formValue = this.thongBaoForm.value;
      const updateRequest = {
        ...formValue,
        id: this.notificationId,
        sentAt: formValue.sentAt ? new Date(formValue.sentAt) : null
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