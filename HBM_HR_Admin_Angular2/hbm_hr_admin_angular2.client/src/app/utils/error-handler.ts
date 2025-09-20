import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { formatDateTime } from './datetime-utils';

export function showApiError(err: any, title: string = 'Lỗi') {
  const apiMessage = err?.error?.message;
  const time = formatDateTime();
  Swal.fire({
    icon: 'error',
    title,
    html: `
    <div>
        <h1>${apiMessage}</h1>
        <strong>${err.message}</strong><br/>
        <strong>Thời gian:</strong> ${time}
        <br/><small style="color:gray;">URL: ${err?.url || '-'}</small>
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
        <strong>Lỗi nghiệp vụ:</strong> ${message} <br/>
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

