import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Input, Output, HostListener, ViewChild, ElementRef } from '@angular/core';

import { Router } from '@angular/router';
import { LoadingService } from '@app/services/loading.service';
import { Observable } from 'rxjs';
import { AuthService } from '@app/services/auth.service';
import { getFullImageUrl } from '@app/utils/url.utils';
import { ROUTE_PATHS } from '@app/app.routes';
import { getLocal } from '@app/utils/json-utils';


@Component({
  selector: 'app-main-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css'],
  imports: [
    CommonModule,
    RouterModule // ✅ bắt buộc có nếu dùng <router-outlet>
  ]
})
export class UserLayoutComponent {
  isLoggedIn: boolean = false;
  tenNhanVien: string = '';
  anhNhanVien: string = '';
  maNhanVien: string = '';
  showCreatePopup = false;
  showSignoutPopup = false;

  isLoading: Observable<boolean>;
  permissions: number[] = [];


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

    var token = localStorage.getItem('access_token');
    this.isLoggedIn = token != null && token.trim() != '';
    this.tenNhanVien = localStorage.getItem('tenNhanVien') || '';
    this.anhNhanVien = getFullImageUrl(localStorage.getItem('anh') || '');
    this.maNhanVien = localStorage.getItem('maNhanVien') || '';

    // this.authService.currentUser$.subscribe((status) => {
    //   if (status?.Status == 'SUCCESS') {
    //     this.isLoggedIn = true;
    //     this.tenNhanVien = this.authService.getCurrentUser()?.TenNhanVien || '';
    //     this.anhNhanVien = this.authService.getCurrentUser()?.Anh || '';
    //     this.anhNhanVien = getFullImageUrl(this.anhNhanVien);
    //     this.maNhanVien = this.authService.getCurrentUser()?.MaNhanVien || '';
    //   }
    //   return status;
    // });
    this.isLoading = this.loadingService.isLoading$;
  }

  ngOnInit() {
    this.permissions = getLocal<number[]>('permissions', []);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate([ROUTE_PATHS.login]);
  }

  togglePopup() {
    this.showSignoutPopup = !this.showSignoutPopup;
  }

  goToAdmin() {
    this.router.navigate([ROUTE_PATHS.admin]);
  }

  title = 'hbm_hr_admin_angular2.client';
}