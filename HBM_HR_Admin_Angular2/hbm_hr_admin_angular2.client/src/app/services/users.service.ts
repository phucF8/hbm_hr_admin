import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UsersService {
  
  private apiUrl = `${environment.apiUrl}/users`;  // Lấy apiUrl từ environment

  constructor(private http: HttpClient) {}

  saveUser(username: string): Observable<any> {
    return this.http.post(this.apiUrl, { username });
  }
}
