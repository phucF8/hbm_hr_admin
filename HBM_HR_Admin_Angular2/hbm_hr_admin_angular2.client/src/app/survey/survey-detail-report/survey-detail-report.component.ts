import { CommonModule } from '@angular/common';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '@app/services/error.service';
import { VotingService } from '@app/services/voting.service';
import { showJsonDebug } from '@app/utils/error-handler';
import Swal from 'sweetalert2';
import { formatDateTime, formatDateTime_ddMMyyyy } from '@app/utils/datetime-utils';
import { copyBlock, fillBlockRecursive, findRowIndexByKey, getBlockRows, insertBlockRows, inspectJson } from '@app/utils/excelUtils';

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
          // showJsonDebug(this.topicReport);
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
    this.exportReport(this.topicReport!);
  }



  async exportReport(topicReport: TopicReportDto) {
    // 1. Load file template
    const response = await fetch('/assets/template.xlsx');
    if (!response.ok) {
      alert(`Không tìm thấy template.xlsx`);
      return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];

    // 2. Thay thế field đơn
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          cell.value = cell.value
            .replace('{{title}}', topicReport.title ?? '')
            .replace('{{description}}', topicReport.description ?? '')
            .replace('{{totalParticip}}', String(topicReport.totalParticipants))
            .replace('{{startDate}}', topicReport.startDate ? new Date(topicReport.startDate).toLocaleDateString('vi-VN') : '')
            .replace('{{endDate}}', topicReport.endDate ? new Date(topicReport.endDate).toLocaleDateString('vi-VN') : '');
        }
      });
    });

    //xác định khối nhiều dòng bởi key
    let blockQues = getBlockRows(worksheet, 'questions');
    if (blockQues) {
      topicReport.questions.forEach((ques, index) => {
        // 1. Chỉ insert nếu chưa phải phần tử cuối
        let newBlockQues
        if (index < topicReport.questions.length - 1) {
          newBlockQues = insertBlockRows(
            worksheet,
            findRowIndexByKey(worksheet, '/questions'),
            blockQues!.rows
          );
        }

        // worksheet.spliceRows(findRowIndexByKey(worksheet, '#questions'), 1);
        // worksheet.spliceRows(findRowIndexByKey(worksheet, '/questions'), 1);

        // 2. Replace placeholder trong block vừa chèn
        blockQues!.rows.forEach((row) => {
          row.eachCell((cell) => {
            if (typeof cell.value === 'string') {
              cell.value = cell.value.replace('{{questionContent}}', ques.content ?? '');
              cell.value = cell.value.replace('{{#questions}}', '');
              cell.value = cell.value.replace('{{/questions}}', '');
            }
          });
        })
        let blockOpt = getBlockRows(worksheet, 'options');
        if (blockOpt) {
          if (ques.options.length > 0) {
            ques.options.forEach((opt, index) => {
              let newBlockOpt
              if (index < ques.options.length - 1) {
                newBlockOpt = insertBlockRows(
                  worksheet,
                  findRowIndexByKey(worksheet, '/options'),
                  blockOpt!.rows
                )
              }
              // worksheet.spliceRows(findRowIndexByKey(worksheet, '#options'), 1);
              // worksheet.spliceRows(findRowIndexByKey(worksheet, '/options'), 1);
              blockOpt!.rows.forEach((row) => {
                row.eachCell((cell) => {
                  if (typeof cell.value === 'string') {
                    cell.value = cell.value.replace('{{optionContent}}', opt.content ?? '');
                    cell.value = cell.value.replace('{{selectedCount}}', String(opt.selectedCount ?? ''));
                    cell.value = cell.value.replace('{{#options}}', '');
                    cell.value = cell.value.replace('{{/options}}', '');
                  }
                });
              });
              if (newBlockOpt)
                blockOpt = newBlockOpt;
            })
          } else {
            blockOpt!.rows.forEach((row) => {
              row.eachCell((cell) => {
                if (typeof cell.value === 'string') {
                  cell.value = cell.value.replace('{{optionContent}}','Tự luận');
                  cell.value = cell.value.replace('{{selectedCount}}',String(ques.essayAnswers.length));
                  cell.value = cell.value.replace('{{#options}}', '');
                  cell.value = cell.value.replace('{{/options}}', '');
                }
              });
            });
          }
        }
        // 3. Cập nhật lại blockQues để chèn tiếp
        if (newBlockQues)
          blockQues = newBlockQues;
      })
    }

    // 4. Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'BaoCao.xlsx');
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

