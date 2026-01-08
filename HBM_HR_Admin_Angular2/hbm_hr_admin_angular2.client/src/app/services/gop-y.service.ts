import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GopYRequest, GopYResponse } from '@app/models/gopy.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GopYService {

  private apiUrl = `${environment.apiUrl}/GopY/GetAllGopYs`;

  constructor(private http: HttpClient) {}

  getAllGopYs(request: GopYRequest): Observable<GopYResponse> {
    return this.http.post<GopYResponse>(this.apiUrl, request);
  }

}