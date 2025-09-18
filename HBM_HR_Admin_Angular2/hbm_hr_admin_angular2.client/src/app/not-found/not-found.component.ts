import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="not-found-container">
      <h1>404 - Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
    </div>
  `,
  styles: [`
    .not-found-container {
      text-align: center;
      margin-top: 100px;
      font-family: Arial, sans-serif;
    }
  `]
})
export class NotFoundComponent { }
