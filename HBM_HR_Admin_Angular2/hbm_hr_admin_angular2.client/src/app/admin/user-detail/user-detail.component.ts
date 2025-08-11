import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BASE_URL } from '@app/constants/constants';
import { Permission, PermissionsService } from '@app/services/permissions.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})

export class UserDetailComponent implements OnInit {

  user!: any;
  permissions: any[] = [];
  userPermissions: number[] = [];

  BASE_URL = BASE_URL;

  constructor(
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<UserDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private permissionsService: PermissionsService
  ) { }

  ngOnInit(): void {
    // Lấy thông tin user từ data truyền vào
    this.user = this.data.user;

    // Gọi đồng thời 2 API
    forkJoin({
      allPermissions: this.permissionsService.getPermissions(),
      userPermissions: this.permissionsService.getUserPermissions(this.user.id)
    }).subscribe(({ allPermissions, userPermissions }) => {
      this.userPermissions = userPermissions;
      // Gắn cờ hasPermission cho từng quyền
      this.permissions = allPermissions.map(p => ({
        ...p,
        hasPermission: this.userPermissions.includes(p.id)
      }));
    });
  }

  loadPermissions() {
    this.permissionsService.getPermissions().subscribe({
      next: (data) => {
        this.permissions = data;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          html: `<pre style="text-align:left;">ERR: ${JSON.stringify(err, null, 2)}</pre>`,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  loadUserPermission() {
    this.permissionsService.getUserPermissions(this.data.user.id)
      .subscribe({
        next: (data) => {
          this.userPermissions = data;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi tải dữ liệu',
            html: `<pre style="text-align:left;">ERR: ${JSON.stringify(err, null, 2)}</pre>`,
            confirmButtonText: 'Đóng'
          });
        }
      });
  }



  togglePermission(permission: any) {
    permission.hasPermission = !permission.hasPermission;
    console.log('XIN CHAO');
  }

  saveChanges() {
    const selectedIds = this.permissions
      .filter(p => p.hasPermission)
      .map(p => p.id);

    this.permissionsService.assignPermissions(this.data.user.id, selectedIds)
      .subscribe({
        next: (res) => {
          if (res.status === 'SUCCESS') {
            this.toastr.success('', res.message || 'Lưu quyền thành công', {
              positionClass: 'toast-top-center',
              timeOut: 1000, // 5s
              progressBar: true
            });
            this.dialogRef.close();
          } else {
            alert('Lưu quyền thất bại');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Có lỗi khi lưu quyền');
        }
      });
  }
  

  save(): void {
    const selectedPermissions = this.permissions
      .filter(p => p.assigned)
      .map(p => p.id);

    // TODO: Gọi API để lưu danh sách quyền cho user
    console.log('Lưu quyền cho user:', this.user.username, selectedPermissions);

    // Đóng dialog và trả dữ liệu
    this.dialogRef.close(selectedPermissions);
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
