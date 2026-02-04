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

  private apiUrl = `${environment.apiUrl}/dwh/etl/job-log`; // API endpoint
  // Token cho DWH API - có thể thay đổi dễ dàng ở đây
  private dwhToken = 'dwh_9F3KpA2XrM8QwL7HcZVtU6YBEnJ5sD4G';

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
      `${this.apiUrl}/list`,
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

  getDetail(id: number): Observable<DataWarehouseItem> {
    return this.http.get<ApiResponse<DataWarehouseItem>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching data warehouse detail:', error);
        throw error;
      })
    );
  }

}
