import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ApiResponse } from '@app/voting/voting-list/responses/api-response.model';

export interface Topic {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  hasAnswered: boolean;
  questions: any[];
}

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

  getTopicForReview(topicId: string): Observable<any> {
    const url = `${this.baseUrl}/topics/review/${topicId}`;
    return this.http.get<any>(url);
  }

  submitAnswers(answers: UserAnswerRequest[]): Observable<any> {
    const url = `${this.baseUrl}/topics/submit`;
    const token = localStorage.getItem('access_token'); // token lưu sau khi login
    if (!token) {
      throw new Error('No access token found');
    }
    return this.http.post<any>(url, answers);
  }

  /** 🔹 Lấy danh sách topic theo userId */
  getTopicsByUser(userId: string): Observable<ApiResponse<Topic[]>> {
    const url = `${this.baseUrl}/topics/topic-list/${userId}`;
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    return this.http.get<ApiResponse<Topic[]>>(url);
  }


}
