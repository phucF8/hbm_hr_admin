import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ThongBaoService } from '../../../services/thong-bao.service';

@Component({
  selector: 'app-tao-thong-bao',
  templateUrl: './tao-thong-bao.component.html',
  styleUrls: ['./tao-thong-bao.component.css'],
  standalone: false
})
export class TaoThongBaoComponent implements OnInit {
  thongBaoForm: FormGroup;
  notificationTypes = [
    { value: 1, label: 'Thông báo hệ thống' },
    { value: 2, label: 'Thông báo cá nhân' },
    { value: 3, label: 'Thông báo nhóm' }
  ];

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
    if (this.thongBaoForm.valid) {
      console.log('📝 Form submitted:', this.thongBaoForm.value);
      // TODO: Implement API call to create notification
      alert('Thông báo đã được tạo thành công!');
      this.router.navigate(['/thong-bao']);
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