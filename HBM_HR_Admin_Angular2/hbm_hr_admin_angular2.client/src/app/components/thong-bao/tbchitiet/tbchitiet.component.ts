import { Component, EventEmitter, OnInit, Input, Output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThongBaoService, TestSendNotificationRequest} from '../../../services/thong-bao.service';
import { NOTIFICATION_TYPES } from '../../../constants/notification-types';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '@app/services/loading.service';
import { v4 as uuidv4 } from 'uuid';
import { DonVi } from '@app/models/donvi';
import { DebugUtils } from '@app/utils/debug-utils';
import { MergedData, DoLookupDatasRP } from '@app/models/thong-bao.model';
import { getFullImageUrl } from '@app/utils/url.utils';

@Component({
  selector: 'chitiet-thong-bao',
  templateUrl: './tbchitiet.component.html',
  styleUrls: ['./tbchitiet.component.css'],
  standalone: false,
  providers: [ThongBaoService]
})
export class TbchitietComponent implements OnInit {
  @Input() notificationId: string = '';  // Nhận notificationId từ component cha
  thongBaoForm: FormGroup;
  searchUserForm: FormGroup;
  notificationTypes = NOTIFICATION_TYPES;
  isSubmitting = false;
  errorMessage = '';
  submitted = false;
  
  filteredUsers: MergedData[] | null = null;
  selectedUsers: MergedData[] = [];
  doLookupDatasRP: DoLookupDatasRP | null = null;
  isUserSearchVisible: boolean = false;
  isSearching: boolean = false;
  status: number = 0; // Trạng thái mặc định là 0 (Chưa gửi)
  idThamChieu: string = '';

  tenNguoiTao: string = '';
  ngayTao: string = '';

  showDonVisPopup = false;
  isFocused = false;

  selectedDonVi: DonVi | null = null;
  donvis: DonVi[] = [
  { id: '385ae8c687d347e4', ma: 'GOL', tenKho: 'GẠCH' },
  { id: 'F98431BCF2404EFC', ma: 'HBMVT', tenKho: 'VPVT' },
  { id: '08a8f3bec5934', ma: 'S001', tenKho: 'VPTÐ' },
  { id: 'd2f012837f434794', ma: 'S002', tenKho: 'THÉP' },
  { id: '2d74d08d99734470', ma: 'S004', tenKho: 'VPYB' },
  { id: '7d1e43e2b0fc4f54', ma: 'S005', tenKho: 'Ô TÔ' },
  { id: '9e9a1bda336343b5', ma: 'S006', tenKho: 'XMMB' },
  { id: 'f4424e5a354b4548', ma: 'S008', tenKho: 'HBYB' },
  { id: '056fef14cbb64105', ma: 'S009', tenKho: 'XMMN' },
  { id: '9513b33e7e58492e', ma: 'VLXD', tenKho: 'VLXD' },
  ];

  modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],        // định dạng chữ
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'header': [1, 2, 3, false] }],
    ['link', 'image'],                      // liên kết, hình ảnh
    ['clean']                               // xóa định dạng
  ]
};


  noiDung: string = '';

  @ViewChild('popup') popupRef!: ElementRef;
	@ViewChild('button') buttonRef!: ElementRef;

  @HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const clickedInsidePopup = this.popupRef?.nativeElement.contains(target);
		const clickedOnButton = this.buttonRef?.nativeElement.contains(target);
		if (!clickedInsidePopup && !clickedOnButton) {
			this.showDonVisPopup = false;
		}
	}

  @Output() closePopupEvent = new EventEmitter<{
    response: boolean;  // Thông báo cho ThongBaoComponent
  }>();

  constructor(
    private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.authService.currentUser$.subscribe((status) => {
      if (status?.Status === 'SUCCESS') {
        this.tenNguoiTao = this.authService.getCurrentUser()?.TenNhanVien || 'Người dùng';
      }
    });
    this.thongBaoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
    });
    this.searchUserForm = this.fb.group({
      search: ['', Validators.required]
    });
  }

  selectDonVi(item: DonVi): void {
    this.selectedDonVi = item;
    this.showDonVisPopup = false;
  }

  ngOnInit(): void {
    if (this.notificationId) {
      this.loadNotification();
      this.isUserSearchVisible = true; // sửa thông báo thì luôn hiện danh sách user - có hợp lý không?
    }
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      var idKhoLamViec = currentUser.DataSets.Table[0].IDKhoLamViec;
      this.selectedDonVi = this.donvis.find(d => d.id === idKhoLamViec ) || null;
    } else {
      console.warn('Chưa đăng nhập hoặc thiếu thông tin người dùng!');
    }
  }

  onBlurInput(value : string) {
    setTimeout(() => {
      this.isFocused = false;
      if (value.trim() === '') {
        this.filteredUsers  = null; // Đặt về null nếu không có từ khóa tìm kiếm
      }
    }, 200); // 200ms hoặc thời gian bạn mong muốn
  }

  //load 1 thông báo từ API và hiển thị lên form
  loadNotification() {
    this.loadingService.show();
    this.thongBaoService.getThongBaoByID(this.notificationId).subscribe({
      next: (notification) => {
        this.loadingService.hide();
        if (notification) {
          this.idThamChieu = notification.idThamChieu || '';
          this.status = notification.status; // Lưu trạng thái thông báo
          if (this.status === 1) {
            this.thongBaoForm.get('notificationType')?.disable();
          } else {
            this.thongBaoForm.get('notificationType')?.enable();
          }
          this.tenNguoiTao = notification.tenNhanVien;
          this.ngayTao = notification.ngayTao;
          this.thongBaoForm.patchValue({
            title: notification.title,
            content: notification.content,
            notificationType: notification.notificationType,
          });

          this.selectedUsers = notification.recipients.map(recipient => (
            {
            ID: recipient.recipientId,
            MaNhanVien: recipient.recipientId, // Nếu recipientId là mã nhân viên
            TenNhanVien: recipient.tenNhanVien,
            tenChucDanh: recipient.tenChucDanh,
            TenPhongBan: recipient.tenPhongBan, // Nếu cần, hãy lấy từ một nguồn khác
            TenChucDanh: recipient.tenChucDanh,
            Anh: getFullImageUrl(recipient.anh),
            status: recipient.status,
            ngayTao: recipient.ngayTao,
          }
        )) as MergedData[];
        } else {
          this.errorMessage = 'Không tìm thấy thông báo';
        }
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error loading notification:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi tải thông báo';
      }
    });
  }
  
  onSubmit() {
    this.submitted = true;
    if (!this.notificationId) {
      this.onSubmitCreateNew();
    } else {
      this.onSubmitUpdate();
    }
  }

  onSubmitUpdate() {
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
          this.closePopupEvent.emit({
            response: true // cần update màn hình danh sách
          });
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

  closePopup(): void {
    this.closePopupEvent.emit(); // Phát sự kiện để thông báo cho ThongBaoComponent
  }

  onSubmitCreateNew() {
    if (this.thongBaoForm.valid && this.selectedUsers.length > 0){
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
        notificationType: 2,
        nguoiTao: currentUser.ID,
        recipients: this.selectedUsers.map(user => user.ID), // Lấy danh sách ID từ selectedUsers
      };
      this.thongBaoService.createThongBao(notificationData).subscribe({
        next: (response) => {
          this.onSend(response.id); // Gọi hàm gửi thông báo ngay sau khi tạo thành công
        },
        error: (error) => {
          this.errorMessage = error.error || 'Đã xảy ra lỗi khi tạo thông báo';
          alert(this.errorMessage);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      for (const key of Object.keys(this.thongBaoForm.controls)) {
        const control = this.thongBaoForm.get(key);
        if (control?.errors) {
          const errorMessages = Object.entries(control.errors)
            .map(([errorKey, errorValue]) => `${errorKey}: ${JSON.stringify(errorValue)}`)
            .join(', ');
          // alert(`${key}: ${errorMessages}`);
          break; // Dừng đúng cách
        }
      }
    }
  }

  responseData: any;
  loading: boolean = false;


  onSend(notificationId: string) {
    if (this.thongBaoForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage = 'Không tìm thấy thông tin người dùng';
        this.isSubmitting = false;
        return;
      }
      const request: TestSendNotificationRequest = {
        NotificationID: notificationId,
        IDNhanViens: this.selectedUsers.map(user => user.ID).join(','),
        Title: this.thongBaoForm.get('title')?.value,
        Body: this.thongBaoForm.get('content')?.value,
        Data: {} // Nếu cần thêm dữ liệu bổ sung, hãy thêm vào đây
      };
      this.thongBaoService.sendThongBao(request).subscribe({
        next: (response) => {
          this.loading = false;
          this.responseData = response;
          this.status = 1; // Cập nhật trạng thái thành công
          if (this.responseData && this.responseData.userStats) {
            this.responseData.userStats.forEach((userStat: any) => {
              const matchedUser = this.selectedUsers.find(user => user.ID === userStat.userId);
              if (matchedUser) {
                matchedUser.status = 1; // Gán status = 1 nếu tìm thấy user trùng khớp
              }
            });
          }
          this.isSubmitting = false;
          this.closePopupEvent.emit({
            response: true // cần update màn hình danh sách
          });
        },
        error: (error) => {
          this.loading = false;
          console.error('❌ Error sending notification:', error);
          this.errorMessage = error.error || 'Đã xảy ra lỗi khi gửi thông báo';
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

  onSearchUser() {
    const searchValue = this.searchUserForm.get('search')?.value?.trim();
    if (!searchValue) {
      this.filteredUsers = null; // Đặt về null nếu không có từ khóa tìm kiếm
      return;
    }
    this.loadingService.show();
    this.isSearching = true;
    this.filteredUsers = []; // Reset trước khi tìm kiếm
    this.thongBaoService.searchUsers(searchValue, this.selectedDonVi?.id || '')
      .pipe(finalize(() => {
        
        this.isSearching = false;
        this.loadingService.hide();

      })) // Đảm bảo luôn thực hiện
      .subscribe({
        next: (response) => {
          this.doLookupDatasRP = response;
          this.filteredUsers = (response?.DatasLookup || []).map(user => ({
            ID: user.ID,
            MaNhanVien: user.MaNhanVien,
            TenNhanVien: user.TenNhanVien,
            Anh: getFullImageUrl(user.Anh),
            TenChucDanh: user.TenChucDanh,
            TenPhongBan: user.TenPhongBan,
            status: 0 // Gán giá trị mặc định vì DoLookupData không có "status"
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
    console.log("user: ", user.ID);
    this.selectedUsers = this.selectedUsers.filter(u => u.ID !== user.ID);
  }

  onNotificationTypeChange() {
    const selectedType = this.thongBaoForm.get('notificationType')?.value;
    this.isUserSearchVisible = selectedType === '2'; // Kiểm tra nếu là loại 2 thì hiển thị tìm kiếm user
  }

  openDonVisPopup() {
		this.showDonVisPopup = !this.showDonVisPopup;
	}

  goToDetail() {
    DebugUtils.openStringInNewWindow(`${this.idThamChieu}`);
    const link = `https://workhub.hbm.vn/HC/GiaiTrinhLink?rq=${this.idThamChieu}`;
    window.open(link, '_blank'); // mở link ở tab mới
  }

}