import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EncryptionService } from '../../services/encryption.service';
import { DebugUtils } from '@app/utils/debug-utils';
import { LoadingService } from '@app/services/loading.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { UsersService } from '@app/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
    private loadingService: LoadingService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/thongbao']).then(() => {

      })
        .catch(error => {
          console.error('LoginComponent: Lỗi chuyển hướng:', error);
        });
    } else {
      console.log('LoginComponent: Chưa có thông tin đăng nhập, hiển thị form đăng nhập');
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.showPassword ? 'text' : 'password';
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin đăng nhập';
      return;
    }
    // Encrypt password before sending
    const encryptedPassword = this.encryptionService.encrypt(this.password);
    this.loadingService.show();
    this.authService.login(this.username, encryptedPassword).subscribe({
      next: (response) => {
        this.loadingService.hide();
        if (response.token != null) {

          // ✅ Gọi API lưu username vào bảng Users
          this.usersService.saveUser(this.username).subscribe({
            next: () => {
            },
            error: (err) => {
              console.error('Lỗi khi lưu user vào bảng Users:', err);
            }
          });
          this.router.navigate(['/thongbao']);
        } else {
          //this.toastr.error('Đã có lỗi xảy ra.', 'Lỗi');
          this.toastr.error('ERROR', response.message, {
            positionClass: 'toast-top-center'
          });

          const errorDetail = JSON.stringify(response) || '';

          Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          html: `
                    <p><b>Mã lỗi:</b> </p>
                    <p><b>Thông báo:</b> </p>
                    ${errorDetail ? `<pre style="text-align:left;white-space:pre-wrap">${errorDetail}</pre>` : ''}
                  `,
          confirmButtonText: 'Đóng'
        });

        }
      },
      error: (error) => {
        this.loadingService.hide();
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
        const errorStatus = error.status;
        const errorMessage = error.message || 'Không rõ lỗi';
        const errorDetail = error.error?.message || JSON.stringify(error.error) || '';

        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          html: `
                    <p><b>Mã lỗi:</b> ${errorStatus}</p>
                    <p><b>Thông báo:</b> ${errorMessage}</p>
                    ${errorDetail ? `<pre style="text-align:left;white-space:pre-wrap">${errorDetail}</pre>` : ''}
                  `,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

}
