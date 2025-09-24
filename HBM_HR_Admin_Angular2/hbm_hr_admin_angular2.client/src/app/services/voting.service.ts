import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { ApiResponse } from '@app/voting/voting-list/responses/api-response.model';
import Swal from 'sweetalert2';
import { showApiBusinessError, showApiError, showJsonDebug } from '@app/utils/error-handler';
import { ToastrService } from 'ngx-toastr';

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
  topicId: string;
  questionId: string;
  optionId?: string;
  essayAnswer?: string;
}

export interface PublishTopicRequest {
  topicId: string;
  userId: string;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VotingService {

  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) { }

  getVotingTopic(topicId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    const userId = localStorage.getItem('id') || '';
    const idKhoLamViec = localStorage.getItem('idKhoLamViec') || '';
    const body = {
      userId: userId,
      idKhoLamViec: idKhoLamViec,
      topicId: topicId,
    };
    // showJsonDebug(body);
    const url = `${this.baseUrl}/topics/voting`;
    return this.http.post<any>(url, body);
  }

  getTopicForReview(topicId: string): Observable<any> {
    var idUser = localStorage.getItem('id');
    const url = `${this.baseUrl}/topics/review/${topicId}/${idUser}`;
    return this.http.get<any>(url);
  }

  getSurveyDetailReport(topicId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/topics/survey-detail-report/${topicId}`);
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
  getTopicsByUser(userId: string, idKhoLamViec: string): Observable<ApiResponse<Topic[]>> {
    const url = `${this.baseUrl}/topics/topic-list`;
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    const body = {
      userId: userId,
      idKhoLamViec: idKhoLamViec,
    };
    // showJsonDebug(body);
    return this.http.post<ApiResponse<Topic[]>>(url, body);
  }

  /** Phát hành phiếu điều tra */
  publishTopic(request: PublishTopicRequest): Observable<any> {
    // showJsonDebug(request);
    return this.http.post<any>(`${this.baseUrl}/topics/publish`, request).pipe(
      map((res) => {
        // showJsonDebug(res)
        if (res.status === 'SUCCESS') {
          this.toastr.success('', res.message || 'Phát hành thành công');
        } else {
          showApiBusinessError(res.message, 'Phát hành thất bại');
        }
        return res;
      }),
      catchError((err: HttpErrorResponse) => {
        showApiError(err, 'Phát hành thất bại');
        return throwError(() => err);
      })
    );
  }


}
