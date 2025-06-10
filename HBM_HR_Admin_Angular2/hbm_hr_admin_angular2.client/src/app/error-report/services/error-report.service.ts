import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../../environments/environment'; 
import { ErrorUserReportRP, ErrUserReportItem } from '../response/err_user_report_rp';
import { ErrorUserReportDetailRP } from '../response/err_user_report_detail_rp';

@Injectable({
  providedIn: 'root'
})
export class ErrorReportService {

  private apiUrl = `${environment.apiUrl}/user_err_report`;  // Lấy apiUrl từ environment

  constructor(private http: HttpClient) { }

  getList(
    pageIndex?: number
  ): Observable<ErrorUserReportRP> {
    let params = new HttpParams()
    if (pageIndex){
      params = params.set('pageIndex', pageIndex);
    } 
    return this.http.get<ErrorUserReportRP>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  getDetail(
    id?: number
  ): Observable<ErrorUserReportDetailRP> {
    let params = new HttpParams()
    return this.http.get<ErrorUserReportDetailRP>(`${this.apiUrl}/err_report/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }
  
  delete(id: number): Observable<void> {
    console.log('Deleting notification:', id);
    return this.http.get<void>(`${this.apiUrl}/del/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting notification:', error);
        throw error;
      })
    );
  }


}
