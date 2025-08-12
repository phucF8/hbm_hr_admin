import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVotingTopic(topicId: string): Observable<any> {
    const url = `${this.baseUrl}/topics/voting/${topicId}`;
    return this.http.get<any>(url);
  }
}
