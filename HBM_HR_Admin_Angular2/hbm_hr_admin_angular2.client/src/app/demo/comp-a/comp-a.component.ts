import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from '../services/shared-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comp-a',
  standalone: true,
  templateUrl: './comp-a.component.html',
  styleUrl: './comp-a.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class CompAComponent {

  inputA: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sharedData: SharedDataService
  ) { }

  ngOnInit() {
    this.inputA = this.sharedData.inputA;
  }

  ngOnDestroy() {
    this.sharedData.inputA = this.inputA;
  }

  goToCompB() {
    this.router.navigate(['demo/comp-b']);
  }

  testXAppToken() {
    const url = 'http://localhost:8088/api/thongbao/test';
    this.http.get(url, {
      headers: {
        'X-App-Token': 'HBM2025!@#SecretKey'
      }
    }).subscribe({
      next: (res) => {
        Swal.fire('✅ Gọi API thành công!\nKết quả: ' + JSON.stringify(res))
      },
      error: (err) => {
        Swal.fire('❌ Gọi API thất bại!\nLỗi: ' + (err.error || err.message))
      }
    });
  }


}
