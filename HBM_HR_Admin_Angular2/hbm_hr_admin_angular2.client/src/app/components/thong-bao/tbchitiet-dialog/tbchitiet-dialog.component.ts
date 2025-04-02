import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThongBaoService,DoLookupDatasRP, MergedData} from '../../../services/thong-bao.service';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { NOTIFICATION_TYPES } from '../../../constants/notification-types';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-tbchitiet-dialog',
  standalone: false,
  templateUrl: './tbchitiet-dialog.component.html',
  styleUrl: './tbchitiet-dialog.component.css'
})
export class TbchitietDialogComponent {

  notificationId: string = '';

  thongBaoForm: FormGroup;
  searchUserForm: FormGroup;

  notificationTypes = NOTIFICATION_TYPES;

  filteredUsers: MergedData[] = [];
  selectedUsers: MergedData[] = [];

  doLookupDatasRP: DoLookupDatasRP | null = null;
  isUserSearchVisible: boolean = false;
  isSearching: boolean = false;
  isSubmitting = false;

  errorMessage = '';


  constructor(
    private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.thongBaoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      notificationType: [1, Validators.required],
      sentAt: ['']
    });
    this.searchUserForm = this.fb.group({
      search: ['',Validators.required]
    });
  }



  onNotificationTypeChange() {
    const selectedType = this.thongBaoForm.get('notificationType')?.value;
    this.isUserSearchVisible = selectedType === '2'; // Kiểm tra nếu là loại 2 thì hiển thị tìm kiếm user
  }

  onSearchUser() {
      const searchValue = this.searchUserForm.get('search')?.value?.trim();
      console.log('Từ khóa tìm kiếm:', searchValue);
      if (!searchValue) {
          this.filteredUsers = [];
          return;
      }
      this.isSearching = true;
      this.filteredUsers = []; // Reset trước khi tìm kiếm
      this.thongBaoService.searchUsers(searchValue)
          .pipe(finalize(() => this.isSearching = false)) // Đảm bảo luôn thực hiện
          .subscribe({
              next: (response) => {
                  this.doLookupDatasRP = response;
                  this.filteredUsers = (response?.DatasLookup || []).map(user => ({
                    ID: user.ID,
                    MaNhanVien: user.MaNhanVien,
                    TenNhanVien: user.TenNhanVien,
                    TenPhongBan: user.TenPhongBan,
                    status: 1 // Gán giá trị mặc định vì DoLookupData không có "status"
                  })) as MergedData[];
                  
              },
              error: (error) => {
                  console.error('Lỗi tìm kiếm người dùng:', error);
                  this.errorMessage = 'Đã xảy ra lỗi khi tìm kiếm, vui lòng thử lại';
                  this.filteredUsers = []; // Tránh giữ kết quả sai
              }
          });
  }

  selectUser(user: any) {
    if (!this.selectedUsers.find(u => u.ID === user.ID)) {
      this.selectedUsers.push(user);
    }
    
    // Log toàn bộ danh sách selectedUsers sau mỗi lần cập nhật
    console.log("Current selectedUsers:", this.selectedUsers.map(u => u.ID));
    
    this.searchUserForm.get('search')?.setValue(''); // Xóa nội dung tìm kiếm sau khi chọn user
    this.filteredUsers = []; // Ẩn danh sách gợi ý
  }

  removeUser(user: any) {
    console.log("user: ",user.ID);
    this.selectedUsers = this.selectedUsers.filter(u => u.ID !== user.ID);
  }

  onCancel() {
    this.router.navigate(['/thongbao']);
  }

  onSubmit() {
    if (!this.notificationId) {
      this.onSubmitCreateNew();
    } else {
      this.onSubmitUpdate();
    }
  }
  
  onSubmitUpdate() {
    console.log('Update thông báo');
    console.log('Form value:', this.thongBaoForm.value);
    console.log('Form valid:', this.thongBaoForm.valid);
    console.log('notification.sentAt:', this.thongBaoForm.value.sentAt);
    if (this.thongBaoForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formValue = this.thongBaoForm.value;
      const notificationData = {
        id: this.notificationId,
        ...formValue,
        sentAt: formValue.sentAt ? formValue.sentAt : null,
        recipients: this.selectedUsers.map(user => user.ID), // Lấy danh sách ID từ selectedUsers
      };
      console.log('onSubmitUpdate: ', this.notificationId);
      this.thongBaoService.updateThongBao(notificationData).subscribe({
        next: (response) => {
          
          //tức là đã update thành công
          //xóa tất cả ds user cũ đi
          //và insert ds user mới

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

  onSubmitCreateNew() {
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
        id: uuidv4(), // Tạo ID ngẫu nhiên
        ...this.thongBaoForm.value,
        senderId: currentUser.ID,
        recipients: this.selectedUsers.map(user => user.ID), // Lấy danh sách ID từ selectedUsers
      };
      
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

}
