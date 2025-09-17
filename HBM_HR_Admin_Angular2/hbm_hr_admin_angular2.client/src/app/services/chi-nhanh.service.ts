import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface ChiNhanh {
    id: string;
    ma: string;
    tenChiNhanh: string;
    idParent?: string;
    children?: any[];
    
}

@Injectable({
    providedIn: 'root'
})
export class ChiNhanhService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Lấy danh sách chi nhánh
    getChiNhanhs(): Observable<ChiNhanh[]> {
        const url = `${this.baseUrl}/ChiNhanhs`;
        return this.http.get<ChiNhanh[]>(url);
    }
}
