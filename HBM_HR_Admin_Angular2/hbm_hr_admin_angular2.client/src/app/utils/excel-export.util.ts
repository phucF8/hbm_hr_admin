// src/app/utils/excel-export.util.ts

import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';

export function exportToExcel(data: any[]): void {
  const exportData = data.map(item => ({
    'Tiêu đề': item.title,
    'Nội dung': item.content,
    'Người gửi': item.tenNhanVien,
    'Ngày tạo': formatDate(item.ngayTao), // Gọi hàm formatDate bên ngoài
    'Hoàn thành': `${item.receivedCount}/${item.totalRecipients}`,
    'Loại thông báo': item.notificationType == 1 ? 'Tự động' : 'Chủ động',
    'Nhóm thông báo': item.loaiThongBao
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

  worksheet['!cols'] = [
    { wch: 15 }, // Tiêu đề
    { wch: 70 }, // Nội dung
    { wch: 25 }, // Người gửi
    { wch: 15 }, // Ngày tạo
    { wch: 20 }, // Hoàn thành
    { wch: 15 }, // Loại thông báo
    { wch: 20 }  // Nhóm thông báo
  ];

  const headerCells = ['A1','B1','C1','D1','E1','F1','G1'];
  headerCells.forEach(cell => {
    if (!worksheet[cell]) return;
    worksheet[cell].s = {
      font: { bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  });

  for (let row = 2; row <= data.length + 1; row++) {
    ['A','C','D','E','F','G'].forEach(col => {
      const cellAddress = `${col}${row}`;
      if (!worksheet[cellAddress]) return;
      worksheet[cellAddress].s = {
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    });
  }

  const workbook: XLSX.WorkBook = { Sheets: { 'Thông Báo': worksheet }, SheetNames: ['Thông Báo'] };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  const now = new Date();
  const timestamp = now.getFullYear() + '-' +
                    String(now.getMonth() + 1).padStart(2, '0') + '-' +
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') + '-' +
                    String(now.getMinutes()).padStart(2, '0') + '-' +
                    String(now.getSeconds()).padStart(2, '0');

  const filename = `Thong Bao_${timestamp}.xlsx`;
  FileSaver.saveAs(blob, filename);
}

// 👉 formatDate function cần chuyển ra file utils hoặc truyền từ bên ngoài
function formatDate(date: any): string {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
