import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private http: HttpClient) { }

  async downloadAndOpenFile(fileName: string): Promise<void> {
    // đang lấy từ server thật http://admin.hbm.vn:8088/
    const url = `${environment.apiUrl}/FileUpload/ViewFile?fileName=${fileName}`;

    try {
      // 1. Gọi API với responseType là 'blob' (tương đương ResponseType.bytes bên Flutter)
      const blob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );

      // 2. Xử lý tên file (loại bỏ .enc nếu có)
      const cleanFileName = fileName.replace('.enc', '');

      // 3. Tạo một URL tạm thời cho Object Blob này
      const blobUrl = window.URL.createObjectURL(blob);

      // 4. Mở file hoặc Tải file
      // Cách A: Mở trong tab mới (Trình duyệt sẽ tự quyết định xem hay tải tùy loại file)
      window.open(blobUrl, '_blank');

      // Cách B: Ép buộc tải xuống (Nếu bạn muốn giống hành động download)
      /*
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = cleanFileName;
      anchor.click();
      */

      // 5. Giải phóng bộ nhớ sau khi sử dụng
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

    } catch (error: any) {
      console.error('Lỗi khi tải file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        // html: `<pre style="text-align:left;">ERR: ${JSON.stringify(error, null, 2)}</pre>`,
        html: `<div style="text-align:left;">
      <p><b>Chi tiết:</b> ${error.message}</p>
      <small style="color: gray;">Mã lỗi: ${error.status} (${error.statusText})</small>
    </div>`,
        confirmButtonText: 'Đóng'
      });
    }
  }
}