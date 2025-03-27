import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThongBaoService } from '../../../services/thong-bao.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NOTIFICATION_TYPES } from '../../../constants/notification-types';

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
  providers: [ThongBaoService, AuthService]
})
export class TaoThongBaoComponent implements OnInit {
  thongBaoForm: FormGroup;
  searchUserForm: FormGroup;
  notificationTypes = NOTIFICATION_TYPES;
  isSubmitting = false;
  errorMessage = '';

  filteredUsers: any[] = [];
  selectedUsers: any[] = [];

  allUsers = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Nguyễn Văn B' },
    { id: 3, name: 'Trần Thị B' },
    { id: 4, name: 'Lê Văn C' },
    { id: 5, name: 'Phạm Thị D' }
  ];

  constructor(
    private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.thongBaoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      notificationType: [1, Validators.required],
      triggerAction: [''],
      sentAt: [null]
    });
    this.searchUserForm = this.fb.group({
      search: ['',Validators.required]
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
      
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage = 'Không tìm thấy thông tin người dùng';
        this.isSubmitting = false;
        return;
      }

      const notificationData = {
        ...this.thongBaoForm.value,
        senderId: currentUser.ID
      };
      
      console.log('📝 Form submitted:', notificationData);
      
      this.thongBaoService.createThongBao(notificationData).subscribe({
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

  onSearchUser() {
    const searchValue = this.searchUserForm.get('search')?.value;
    console.log('Từ khóa tìm kiếm:', searchValue);
    if (searchValue.trim() === '') {
          this.filteredUsers = [];
          return;
    }
    this.filteredUsers = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }
  


  // onSearchUser() {
  //   console.log('onSearchUser: ',this.searchQuery);
  //   if (this.searchQuery.trim() === '') {
  //     this.filteredUsers = [];
  //     return;
  //   }
  //   this.filteredUsers = this.allUsers.filter(user =>
  //     user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
  //   );
  // }

  selectUser(user: any) {
    if (!this.selectedUsers.find(u => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.searchUserForm.get('search')?.setValue(''); // Xóa nội dung tìm kiếm sau khi chọn user
    this.filteredUsers = []; // Ẩn danh sách gợi ý
  }

  removeUser(user: any) {
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
  }

} 