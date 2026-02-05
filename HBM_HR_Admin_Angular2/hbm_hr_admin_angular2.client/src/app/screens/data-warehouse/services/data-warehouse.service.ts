import { HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { 
  DataWarehouseItem, 
  DataWarehouseListResponse,
  DwhLogListRequest,
  ApiResponse 
} from '../models/data-warehouse.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataWarehouseService {

  private apiUrl = `${environment.apiUrl}/dwh`; // API endpoint
  // Token cho DWH API lấy từ môi trường để dễ cấu hình
  private dwhToken = environment.dwhToken;

  constructor(private http: HttpClient) { }

  // Helper method để tạo headers với token
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-App-Token': this.dwhToken,
      'Content-Type': 'application/json'
    });
  }

  getList(
    pageNumber: number = 1,
    pageSize: number = 20,
    filters?: {
      idJob?: number;
      fromDate?: string;
      toDate?: string;
      search?: string;
    }
  ): Observable<DataWarehouseListResponse> {
    const request: DwhLogListRequest = {
      pageNumber,
      pageSize,
      ...filters
    };

    return this.http.post<ApiResponse<DataWarehouseListResponse>>(
      `${this.apiUrl}/etl/job-log/list`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching data warehouse list:', error);
        throw error;
      })
    );
  }

  getDetail(id: string | number): Observable<DataWarehouseItem> {
    const body = { id };
    return this.http.post<ApiResponse<DataWarehouseItem>>(
      `${this.apiUrl}/etl/job-log/detail`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching data warehouse detail:', error);
        throw error;
      })
    );
  }

  assignNotificationRecipients(userIds: string[]): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/notification/recipients`,
      userIds,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error assigning notification recipients:', error);
        throw error;
      })
    );
  }

  getNotificationRecipientsList(): Observable<any[]> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/notification/recipients/list`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching notification recipients list:', error);
        throw error;
      })
    );
  }

}
