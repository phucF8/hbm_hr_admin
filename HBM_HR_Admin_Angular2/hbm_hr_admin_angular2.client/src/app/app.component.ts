import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service'; // Đảm bảo đường dẫn đúng
import { Router } from '@angular/router';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  tenNhanVien: string = '';
  public forecasts: WeatherForecast[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private router: Router) {
      this.authService.currentUser$.subscribe((status) => {
        //this.isLoggedIn = status;
        console.log('isLoggedIn:', status);
        if (status?.Status == 'SUCCESS') {
          this.isLoggedIn = true;
          this.tenNhanVien = this.authService.getCurrentUser()?.TenNhanVien || 'Người dùng';
        }
        return status;
      });
    }

  ngOnInit() {
    this.getForecasts();
    console.log('APP  đã được khởi tạo!');

    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.tenNhanVien = this.authService.getCurrentUser()?.TenNhanVien || 'Người dùng';
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  getForecasts() {
    this.http.get<WeatherForecast[]>('/weatherforecast').subscribe(
      (result) => {
        this.forecasts = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  title = 'hbm_hr_admin_angular2.client';
}
