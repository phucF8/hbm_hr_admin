import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { formatDateTime } from './datetime-utils';
import { safeStringify } from './json-utils';

export function showApiError(err: any, title: string = 'Lỗi') {
  const time = formatDateTime();
  // Thông điệp từ payload API (nếu có)
  const apiStatus = err?.error?.Status || err?.status; // ví dụ FAIL hoặc 500
  const apiMessage = err?.error?.Message || err?.error?.message;
  // Thông điệp mặc định từ HttpErrorResponse
  const httpMessage = err?.message;
  Swal.fire({
    icon: 'error',
    title,
    html: `
  <div style="text-align:left; font-family:monospace; font-size:0.9em;">
      <h1 style="color:#c00; font-size:1.1em; margin-bottom:4px;">${apiMessage || ''}</h1>
      <hr/>
      <strong>HTTP Message:</strong> ${httpMessage || ''} <br/>
      <hr/>
      <strong>Thời gian:</strong> ${time} <br/>
      <hr/>
      <small style="color:gray;">URL: ${err?.url || ''}</small>
  </div>
    `,
    confirmButtonText: 'Đóng',
    customClass: {
      popup: 'swal2-border-api'
    }
  });
}

export function showApiBusinessError(
  message: string,
  title = 'Lỗi nghiệp vụ',
  code?: string
) {
  const time = formatDateTime();
  Swal.fire({
    icon: 'warning',
    title,
    html: `
      <div style="text-align:left; font-family:monospace; font-size:0.9em; color:#e67e22;">
        <strong>${message}</strong><br/>
        ${code ? `<strong>Mã lỗi:</strong> ${code} <br/>` : ''}
        <strong>Thời gian:</strong> ${time}
      </div>
    `,
    confirmButtonText: 'Đóng',
    customClass: {
      popup: 'swal2-border-business'
    }
  });
}

export function showJsonDebug(data: any) {
  Swal.fire({
    icon: 'info',
    title: 'DEBUG',
    html: `<pre style="text-align:left; font-family: monospace; font-size: 0.85em; white-space: pre-wrap;">${safeStringify(data)}</pre>`,
    confirmButtonText: 'Đóng',
    width: 600,
  });
}
