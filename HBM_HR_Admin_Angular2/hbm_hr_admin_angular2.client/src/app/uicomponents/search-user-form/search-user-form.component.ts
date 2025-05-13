import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThongBaoService } from '../../services/thong-bao.service';
import { MergedData } from '@app/models/thong-bao.model';
import { finalize } from 'rxjs/operators';
import { DebugUtils } from '@app/utils/debug-utils';
import { DonVi } from '@app/models/donvi';

@Component({
  selector: 'app-search-user-form',
  standalone: false,
  templateUrl: './search-user-form.component.html',
  styleUrl: './search-user-form.component.css'
})

export class SearchUserFormComponent {
  @Output() selectedUsersChange = new EventEmitter<any[]>(); // ✅ thêm dòng này
  
  searchUserForm: FormGroup;
  isFocused: boolean = false;
  showDonVisPopup: boolean = false;

  filteredUsers: any[] = [];
  selectedUsers: any[] = [];
  isSearching: boolean = false;

  selectedDonVi: any;
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

  constructor(
    private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
  ) {
    this.searchUserForm = this.fb.group({
      search: ['']
    });
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      var idKhoLamViec = currentUser.DataSets.Table[0].IDKhoLamViec;
      this.selectedDonVi = this.donvis.find(d => d.id === idKhoLamViec ) || null;
    } else {
      console.warn('Chưa đăng nhập hoặc thiếu thông tin người dùng!');
    }
  }

  onSubmit() {
    const searchValue = this.searchUserForm.value.search;
    // this.searchUser.emit(searchValue);
    // const searchValue = this.searchUserForm.get('search')?.value?.trim();
      if (!searchValue) {
        this.filteredUsers = []; // Đặt về null nếu không có từ khóa tìm kiếm
        return;
      }
      this.isSearching = true;
      this.filteredUsers = []; // Reset trước khi tìm kiếm
      this.thongBaoService.searchUsers(searchValue, this.selectedDonVi?.id || '')
        .pipe(finalize(() => this.isSearching = false)) // Đảm bảo luôn thực hiện
        .subscribe({
          next: (response) => {
            this.filteredUsers = (response?.DatasLookup || []).map(user => ({
              ID: user.ID,
              MaNhanVien: user.MaNhanVien,
              TenNhanVien: user.TenNhanVien,
              TenPhongBan: user.TenPhongBan,
              TenChucDanh: user.TenChucDanh,
              status: 0 // Gán giá trị mặc định vì DoLookupData không có "status"
            })) as MergedData[];
          },
          error: (error) => {
            console.error('Lỗi tìm kiếm người dùng:', error);
            this.filteredUsers = []; // Tránh giữ kết quả sai
          }
        });
  }

  selectDonVi(item: any): void {
      // this.donViSelected.emit(item);
      this.selectedDonVi = item;
      this.showDonVisPopup = false;
    }

  selectUser(user: any) {
    if (!this.selectedUsers.find(u => u.ID === user.ID)) {
      this.selectedUsers.push(user);
    }
    this.searchUserForm.get('search')?.setValue(''); // Xóa nội dung tìm kiếm sau khi chọn user
    this.filteredUsers = []; // Ẩn danh sách gợi ý
    this.selectedUsersChange.emit(this.selectedUsers);
     this.isFocused = true; // Đặt lại trạng thái focus


    if (this.selectedUsers.length > 0) {
      for (let i = 0; i < this.selectedUsers.length; i++) {
        const user = this.selectedUsers[i];
        console.log('User', i + 1, ':', JSON.stringify(user));
      } 
    }
    

  }

  removeUser(user: any) {
    console.log('REMOVE USER', user);
    this.selectedUsers = this.selectedUsers.filter(u => u.ID !== user.ID);
    this.selectedUsersChange.emit(this.selectedUsers);
  }

  onBlurInput(value: string) {
    // this.blurInput.emit(value);
    setTimeout(() => {
      this.isFocused = false;
      if (value.trim() === '') {
        this.filteredUsers  = []; // Đặt về null nếu không có từ khóa tìm kiếm
      }
    }, 200); // 200ms hoặc thời gian bạn mong muốn
  }


}
