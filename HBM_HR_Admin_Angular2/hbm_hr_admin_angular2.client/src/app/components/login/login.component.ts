import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EncryptionService } from '../../services/encryption.service';
import { DebugUtils } from '@app/utils/debug-utils';
import { LoadingService } from '@app/services/loading.service';
import { ToastrService } from 'ngx-toastr';

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
    private loadingService: LoadingService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/thongbao']).then(() => {})
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
        if (response.Status == 'SUCCESS'){
          this.router.navigate(['/thongbao']); 
        }else{
          //this.toastr.error('Đã có lỗi xảy ra.', 'Lỗi');
          this.toastr.error('ERROR', response.Message, {
            positionClass: 'toast-top-center'
          });
        }
      },
      error: (error) => {
        this.loadingService.hide();
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
      }
    });
  }

}
