import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    console.log('LoginComponent đã được khởi tạo!');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.showPassword ? 'text' : 'password';
  }

  onSubmit() {
    this.http.post('http://localhost:5000/api/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe(response => {
      console.log('Đăng nhập thành công:', response);
      localStorage.setItem('token', JSON.stringify(response));
      this.router.navigate(['/dashboard']); // Chuyển hướng sau khi đăng nhập
    }, error => {
      console.error('Lỗi đăng nhập:', error);
    });
  }
}
