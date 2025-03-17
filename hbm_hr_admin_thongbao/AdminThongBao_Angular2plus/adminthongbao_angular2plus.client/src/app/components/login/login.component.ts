import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Đăng nhập thành công!', response);

        // Lưu token hoặc thông tin người dùng nếu có
        localStorage.setItem('token', response.token);

        // Chuyển hướng sau khi đăng nhập
        this.router.navigate(['/notifications']);
      },
      error: (err) => {
        console.error('Lỗi đăng nhập:', err);
        alert('Sai tài khoản hoặc mật khẩu!');
      }
    });
  }
}

