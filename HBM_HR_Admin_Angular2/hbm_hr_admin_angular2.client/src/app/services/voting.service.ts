import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface UserAnswerRequest {
  questionId: string;
  optionId?: string;
  essayAnswer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VotingService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getVotingTopic(topicId: string): Observable<any> {
    const url = `${this.baseUrl}/topics/voting/${topicId}`;
    return this.http.get<any>(url);
  }

  submitAnswers(answers: UserAnswerRequest[]): Observable<any> {
    const url = `${this.baseUrl}/topics/submit`;
    const token = localStorage.getItem('access_token'); // token lưu sau khi login
    if (!token) {
      throw new Error('No access token found');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(url, answers, { headers });
  }

}
