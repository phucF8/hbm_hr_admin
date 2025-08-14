// src/app/services/error.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<string[] | null>(null);
  public error$: Observable<string[] | null> = this.errorSubject.asObservable();

  showError(messages: string[] | null) {
    let msg: string;
    this.errorSubject.next(messages);
    // setTimeout(() => this.clearError(), 5000); // 5 giây tự ẩn
  }

  clearError() {
    this.errorSubject.next(null);
  }
}
