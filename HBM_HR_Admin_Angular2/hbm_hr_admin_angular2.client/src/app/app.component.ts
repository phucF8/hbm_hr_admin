import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Input, Output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from './services/auth.service'; // Đảm bảo đường dẫn đúng
import { Router } from '@angular/router';
import { LoadingService } from '@app/services/loading.service';
import { Observable } from 'rxjs';
import { DebugUtils } from './utils/debug-utils';

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
  showCreatePopup = false;
  showSignoutPopup = false;

  isLoading: Observable<boolean>;


  @ViewChild('popup') popupRef!: ElementRef;
	@ViewChild('button') buttonRef!: ElementRef;

  @HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const clickedInsidePopup = this.popupRef?.nativeElement.contains(target);
		const clickedOnButton = this.buttonRef?.nativeElement.contains(target);
		if (!clickedInsidePopup && !clickedOnButton) {
			this.showSignoutPopup = false;
		}
	}

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private loadingService: LoadingService,
    private router: Router) {
      this.authService.currentUser$.subscribe((status) => {
        if (status?.Status == 'SUCCESS') {
          this.isLoggedIn = true;
          this.tenNhanVien = this.authService.getCurrentUser()?.TenNhanVien || 'Người dùng';
        }
        return status;
      });
      this.isLoading = this.loadingService.isLoading$;
    }


  ngOnInit() {
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

  togglePopup() {
    this.showSignoutPopup = !this.showSignoutPopup;
  }

  title = 'hbm_hr_admin_angular2.client';
}
