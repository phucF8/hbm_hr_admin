import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '@app/services/error.service';
import { VotingService } from '@app/services/voting.service';
import { showJsonDebug } from '@app/utils/error-handler';
import Swal from 'sweetalert2';

interface OptionDto {
  id: string;
  content: string;
  orderNumber: number;
  selectedCount: number;
}

interface EssayAnswerDto {
  userId: string;
  username: string;
  fullName: string;
  essayAnswer: string;
  createdAt: string;
}
interface QuestionDto {
  id: string;
  content: string;
  type: string; // SingleChoice | MultiChoice | Essay
  orderNumber: number;
  options: OptionDto[];
  userAnswers: any[];
  essayAnswers: EssayAnswerDto[];
}

export interface TopicReportDto {
  id: string;
  title: string;
  description?: string; // có thể null nên để optional
  startDate: string;    // hoặc Date nếu bạn parse
  endDate: string;      // hoặc Date nếu bạn parse
  createdAt: string;    // hoặc Date
  updatedAt?: string;   // có thể null
  hasAnswered: boolean;
  totalParticipants: number; // sửa từ Int -> number
  questions: QuestionDto[];
}




@Component({
  selector: 'app-survey-detail-report',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './survey-detail-report.component.html',
  styleUrl: './survey-detail-report.component.css'
})
export class SurveyDetailReportComponent implements OnInit {

  topicReport?: TopicReportDto;
  loading = false;
  topicId: string = '';

  constructor(
    private votingService: VotingService,
    private errorService: ErrorService,
    private dialogRef: MatDialogRef<SurveyDetailReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { topicId: string }
  ) {
    this.topicId = data.topicId;
    this.loadReport();
  }

  ngOnInit(): void {
    // this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.votingService.getSurveyDetailReport(this.topicId).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.topicReport = res.data;
          showJsonDebug(this.topicReport);
        } else {
          this.errorService.showError([res.message || 'Không tải được báo cáo']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Đã xảy ra lỗi khi tải danh sách chủ đề',
          html: error.status === 0
            ? 'Không nhận được phản hồi từ server. Có thể server chưa chạy hoặc bị chặn kết nối.'
            : error.message,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  exportToExcel() {
    this._exportToExcel(this.topicReport);
  }

  _exportToExcel(topicReport: any) {
    // Chuẩn bị dữ liệu để xuất
    const exportData: any[] = [];

    // Thêm thông tin chung
    exportData.push({
      'Chủ đề': topicReport.title,
      'Mô tả': topicReport.description,
      'Ngày bắt đầu': topicReport.startDate,
      'Ngày kết thúc': topicReport.endDate,
      'Tổng người trả lời': topicReport.totalParticipants
    });

    exportData.push({}); // dòng trống

    // Thêm danh sách câu hỏi + lựa chọn
    topicReport.questions.forEach((q: any, index: number) => {
      exportData.push({ 'Câu hỏi': `${index + 1}. ${q.content}` });

      q.options.forEach((opt: any) => {
        exportData.push({
          '  Lựa chọn': opt.content,
          '  Số người chọn': opt.selectedCount
        });
      });

      exportData.push({}); // dòng trống sau mỗi câu hỏi
    });

    // Tạo worksheet và workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Báo cáo': worksheet },
      SheetNames: ['Báo cáo']
    };

    // Xuất file
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, `${topicReport.title}.xlsx`);
  }

  getOptionPercentage(
    option: OptionDto,
    totalParticipants: number
  ): number {
    if (!totalParticipants || totalParticipants === 0) return 0;
    return (option.selectedCount / totalParticipants) * 100;
  }

  onClose() {
    this.dialogRef.close();
  }

}

