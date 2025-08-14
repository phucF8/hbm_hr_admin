import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Input, Output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from './services/auth.service'; // Đảm bảo đường dẫn đúng
import { Router } from '@angular/router';
import { LoadingService } from '@app/services/loading.service';
import { ErrorService } from '@app/services/error.service';
import { Observable } from 'rxjs';
import { DebugUtils } from './utils/debug-utils';
import { getFullImageUrl } from './utils/url.utils';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {

  isLoading: Observable<boolean>;
   errorMessage: Observable<string[] | null>;

  constructor(
    private loadingService: LoadingService,
    public errorService: ErrorService
  ){
    this.isLoading = loadingService.isLoading$
    this.errorMessage = errorService.error$;
  }
  
}
