import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VotingListRP } from './responses/voting_list_rp';


@Injectable({
  providedIn: 'root'
})
export class VotingListService {
  private apiUrl = 'http://localhost:8088/api/topics';

  constructor(private http: HttpClient) { }

  getList(): Observable<VotingListRP> {
    return this.http.get<VotingListRP>(this.apiUrl);
  }
  

}
