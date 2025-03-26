import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThongBaoService } from '../../../services/thong-bao.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tao-thong-bao',
  templateUrl: './tao-thong-bao.component.html',
  styleUrls: ['./tao-thong-bao.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [ThongBaoService]
})
export class TaoThongBaoComponent implements OnInit {
  thongBaoForm: FormGroup;
  notificationTypes = [
    { value: 1, label: 'Thông báo hệ thống' },
    { value: 2, label: 'Thông báo cá nhân' },
    { value: 3, label: 'Thông báo nhóm' }
  ];
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
    private router: Router
  ) {
    this.thongBaoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      notificationType: [1, Validators.required],
      triggerAction: ['']
    });
  }

  ngOnInit(): void {
    console.log('🚀 TaoThongBaoComponent initialized');
  }

  onSubmit() {
    console.log('Submit button clicked');
    console.log('Form value:', this.thongBaoForm.value);
    console.log('Form valid:', this.thongBaoForm.valid);
    
    if (this.thongBaoForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      console.log('📝 Form submitted:', this.thongBaoForm.value);
      
      this.thongBaoService.createThongBao(this.thongBaoForm.value).subscribe({
        next: (response) => {
          console.log('✅ Notification created successfully:', response);
          alert('Thông báo đã được tạo thành công!');
          this.router.navigate(['/thong-bao']);
        },
        error: (error) => {
          console.error('❌ Error creating notification:', error);
          this.errorMessage = error.error || 'Đã xảy ra lỗi khi tạo thông báo';
        },
        complete: () => {
          console.log('Request completed');
          this.isSubmitting = false;
        }
      });
    } else {
      console.error('❌ Form is invalid');
      Object.keys(this.thongBaoForm.controls).forEach(key => {
        const control = this.thongBaoForm.get(key);
        if (control?.errors) {
          console.error(`${key} errors:`, control.errors);
        }
      });
    }
  }

  onCancel() {
    console.log('❌ Cancelling form submission');
    this.router.navigate(['/thong-bao']);
  }
} 