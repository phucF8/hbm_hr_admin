import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VotingListRP } from './responses/voting_list_rp';
import { ApiResponse } from './responses/api-response.model';
import { TopicDetail } from './responses/topic-detail.model';
import { environment } from 'environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class VotingListService {
  private apiUrl = `${environment.apiUrl}/topics`;  // Lấy apiUrl từ environment

  constructor(private http: HttpClient) { }

  getList(): Observable<VotingListRP> {
    return this.http.get<VotingListRP>(this.apiUrl);
  }

  getDetail(id: string): Observable<ApiResponse<TopicDetail>> {
    return this.http.get<ApiResponse<TopicDetail>>(`${this.apiUrl}/${id}`);
  }

  updateTopic(topic: TopicDetail): Observable<ApiResponse<any>> {
    Swal.fire({
          icon: 'error',
          title: `${this.apiUrl}/update`,
          html: `<pre style="text-align:left;">ERR: ${JSON.stringify(topic, null, 2)}</pre>`,
          confirmButtonText: 'Đóng'
        });
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/update`, topic);
  }

  deleteTopics(topicIds: string[]): Observable<any> {
    const url = `${this.apiUrl}/DeleteList`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, topicIds, { headers }); // 👈 Sửa ở đây
  }


  createTopic(topic: any): Observable<any> {
    const url = `${this.apiUrl}/Create`;
    return this.http.post(url, topic);
  }

}
