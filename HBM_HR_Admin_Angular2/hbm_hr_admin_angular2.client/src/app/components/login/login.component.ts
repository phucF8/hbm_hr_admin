import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EncryptionService } from '../../services/encryption.service';

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
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    console.log('LoginComponent: ngOnInit started');
    // Kiểm tra nếu đã có thông tin đăng nhập
    if (this.authService.isLoggedIn()) {
      console.log('LoginComponent: Đã tìm thấy thông tin đăng nhập, chuyển hướng đến trang thông báo');
      this.router.navigate(['/thongbao']).then(() => {
        console.log('LoginComponent: Chuyển hướng thành công');
      }).catch(error => {
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

    this.authService.login(this.username, encryptedPassword).subscribe({
      next: (response) => {
        console.log('Đăng nhập thành công:', response);
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.router.navigate(['/thongbao']); 
      },
      error: (error) => {
        console.error('Lỗi đăng nhập:', error);
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
      }
    });
  }
}
