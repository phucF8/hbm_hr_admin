import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  show() {
    this.loadingSubject.next(true);
    console.log("Loading...");
  }

  hide() {
    this.loadingSubject.next(false);
    console.log("...Loading");
  }
}
