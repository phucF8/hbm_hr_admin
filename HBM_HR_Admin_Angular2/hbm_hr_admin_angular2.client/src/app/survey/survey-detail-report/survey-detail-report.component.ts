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

  /**Hàm load template */
  async loadTemplate(path: string): Promise<ExcelJS.Workbook> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Không tìm thấy ${path}`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    return workbook;
  }

  /**Hàm thay thế field đơn (flat placeholders) */
  replaceSimpleFields(worksheet: ExcelJS.Worksheet, data: Record<string, any>) {
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          Object.keys(data).forEach((key) => {
            const placeholder = `{{${key}}}`;
            cell.value = (cell.value as string).replace(placeholder, String(data[key] ?? ''));
          });
        }
      });
    });
  }

  fillBlock(
    worksheet: ExcelJS.Worksheet,
    key: string,
    items: any[],
  ) {
    let block = getBlockRows(worksheet, key);
    if (!block) return;

    items.forEach((item, index) => {
      let newBlock;
      if (index < items.length - 1) {
        newBlock = insertBlockRows(
          worksheet,
          findRowIndexByKey(worksheet, `/${key}`),
          block!.rows
        );
      }

      // Thay giá trị cho block hiện tại
      block!.rows.forEach((row) => {
        row.eachCell((cell) => {
          if (typeof cell.value === 'string') {
            // Thay các field đơn trong item
            Object.keys(item).forEach((k) => {
              const placeholder = `{{${k}}}`;
              const val = Array.isArray(item[k]) ? '' : String(item[k] ?? '');
              cell.value = (cell.value as string).replace(placeholder, val);
            });

            // Xoá marker block
            cell.value = (cell.value as string)
              .replace(`{{#${key}}}`, '')
              .replace(`{{/${key}}}`, '');
          }
        });
      });

      // Đệ quy cho field mảng con
      Object.keys(item).forEach((k) => {
        if (Array.isArray(item[k])) {
          this.fillBlock(worksheet, k, item[k]); // xử lý lồng nhau
        }
      });

      if (newBlock) block = newBlock;
    });
  }

  buildReportData(topicReport: TopicReportDto) {
    if (!topicReport) return;
    return {
      title: topicReport.title ?? '',
      description: topicReport.description ?? '',
      totalParticip: String(topicReport.totalParticipants),
      startDate: topicReport.startDate
        ? new Date(topicReport.startDate).toLocaleDateString('vi-VN')
        : '',
      endDate: topicReport.endDate
        ? new Date(topicReport.endDate).toLocaleDateString('vi-VN')
        : '',
      questions: topicReport.questions.map((q) => ({
        questionContent: q.content ?? '',
        options: q.options.length
          ? q.options.map((o) => ({
            optionContent: o.content ?? '',
            selectedCount: String(o.selectedCount ?? ''),
          }))
          : [
            {
              optionContent: 'Tự luận',
              selectedCount: String(q.essayAnswers.length),
            },
          ],
      })),
    };
  }

  fillBlockRecursive(
    worksheet: ExcelJS.Worksheet,
    key: string,
    data: any
  ) {
    const block = getBlockRows(worksheet, key);
    if (!block) return;

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        let newBlock: typeof block | null = null;
        if (index < data.length - 1) {
          newBlock = insertBlockRows(
            worksheet,
            block.endRow,
            block.rows
          );
        }

        this.fillBlockRecursive(worksheet, key, item);
        if (newBlock) {
          block.rows = newBlock.rows;
        }
      });
    } else if (typeof data === 'object') {
      block.rows.forEach((row) => {
        row.eachCell((cell) => {
          if (typeof cell.value === 'string') {
            // thay thế field đơn
            Object.keys(data).forEach((k) => {
              if (typeof data[k] !== 'object') {
                const placeholder = `{{${key}.${k}}}`;
                cell.value = (cell.value as string).replace(
                  placeholder,
                  String(data[k] ?? '')
                );
              }
            });

            // bỏ marker
            cell.value = (cell.value as string)
              .replace(`{{#${key}}}`, '')
              .replace(`{{/${key}}}`, '');
          }
        });
      });

      // tiếp tục đệ quy cho nested object/array
      Object.keys(data).forEach((k) => {
        if (typeof data[k] === 'object') {
          this.fillBlockRecursive(worksheet, k, data[k]);
        }
      });
    }
  }

  async exportReport(topicReport: TopicReportDto) {
    // 1. Load template
    const workbook = await this.loadTemplate('/assets/template.xlsx');
    const worksheet = workbook.worksheets[0];

    // 2. Thay thế field đơn
    this.replaceSimpleFields(worksheet, {
      title: topicReport.title,
      description: topicReport.description,
      totalParticip: topicReport.totalParticipants,
      startDate: topicReport.startDate ? new Date(topicReport.startDate).toLocaleDateString('vi-VN') : '',
      endDate: topicReport.endDate ? new Date(topicReport.endDate).toLocaleDateString('vi-VN') : ''
    });

    // 3. Đổ dữ liệu cho các block mảng
    // this.fillBlock(worksheet, 'questions', topicReport.questions);

    // 2. Chuẩn hóa dữ liệu
    const reportData = this.buildReportData(topicReport);
    if (!reportData) return;

    // 3. Fill dữ liệu

    this.fillBlock(worksheet,'questions',reportData.questions);

    // this.fillBlockRecursive(worksheet, 'title', reportData.title);
    // this.fillBlockRecursive(worksheet, 'description', reportData.description);
    // this.fillBlockRecursive(worksheet, 'totalParticip', reportData.totalParticip);
    // this.fillBlockRecursive(worksheet, 'startDate', reportData.startDate);
    // this.fillBlockRecursive(worksheet, 'endDate', reportData.endDate);
    // this.fillBlockRecursive(worksheet, 'questions', reportData.questions);

    // 4. Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'BaoCao.xlsx');
  }

  // async exportReport(topicReport: TopicReportDto) {
  //   // 1. Load file template
  //   const response = await fetch('/assets/template.xlsx');
  //   if (!response.ok) {
  //     alert(`Không tìm thấy template.xlsx`);
  //     return;
  //   }
  //   const arrayBuffer = await response.arrayBuffer();
  //   const workbook = new ExcelJS.Workbook();
  //   await workbook.xlsx.load(arrayBuffer);
  //   const worksheet = workbook.worksheets[0];

  //   // 2. Thay thế field đơn
  //   worksheet.eachRow((row) => {
  //     row.eachCell((cell) => {
  //       if (typeof cell.value === 'string') {
  //         cell.value = cell.value
  //           .replace('{{title}}', topicReport.title ?? '')
  //           .replace('{{description}}', topicReport.description ?? '')
  //           .replace('{{totalParticip}}', String(topicReport.totalParticipants))
  //           .replace('{{startDate}}', topicReport.startDate ? new Date(topicReport.startDate).toLocaleDateString('vi-VN') : '')
  //           .replace('{{endDate}}', topicReport.endDate ? new Date(topicReport.endDate).toLocaleDateString('vi-VN') : '');
  //       }
  //     });
  //   });

  //   //xác định khối nhiều dòng bởi key
  //   let blockQues = getBlockRows(worksheet, 'questions');
  //   if (blockQues) {
  //     topicReport.questions.forEach((ques, index) => {
  //       // 1. Chỉ insert nếu chưa phải phần tử cuối
  //       let newBlockQues
  //       if (index < topicReport.questions.length - 1) {
  //         newBlockQues = insertBlockRows(
  //           worksheet,
  //           findRowIndexByKey(worksheet, '/questions'),
  //           blockQues!.rows
  //         );
  //       }

  //       // worksheet.spliceRows(findRowIndexByKey(worksheet, '#questions'), 1);
  //       // worksheet.spliceRows(findRowIndexByKey(worksheet, '/questions'), 1);

  //       // 2. Replace placeholder trong block vừa chèn
  //       blockQues!.rows.forEach((row) => {
  //         row.eachCell((cell) => {
  //           if (typeof cell.value === 'string') {
  //             cell.value = cell.value.replace('{{questionContent}}', ques.content ?? '');
  //             cell.value = cell.value.replace('{{#questions}}', '');
  //             cell.value = cell.value.replace('{{/questions}}', '');
  //           }
  //         });
  //       })
  //       let blockOpt = getBlockRows(worksheet, 'options');
  //       if (blockOpt) {
  //         if (ques.options.length > 0) {
  //           ques.options.forEach((opt, index) => {
  //             let newBlockOpt
  //             if (index < ques.options.length - 1) {
  //               newBlockOpt = insertBlockRows(
  //                 worksheet,
  //                 findRowIndexByKey(worksheet, '/options'),
  //                 blockOpt!.rows
  //               )
  //             }
  //             // worksheet.spliceRows(findRowIndexByKey(worksheet, '#options'), 1);
  //             // worksheet.spliceRows(findRowIndexByKey(worksheet, '/options'), 1);
  //             blockOpt!.rows.forEach((row) => {
  //               row.eachCell((cell) => {
  //                 if (typeof cell.value === 'string') {
  //                   cell.value = cell.value.replace('{{optionContent}}', opt.content ?? '');
  //                   cell.value = cell.value.replace('{{selectedCount}}', String(opt.selectedCount ?? ''));
  //                   cell.value = cell.value.replace('{{#options}}', '');
  //                   cell.value = cell.value.replace('{{/options}}', '');
  //                 }
  //               });
  //             });
  //             if (newBlockOpt)
  //               blockOpt = newBlockOpt;
  //           })
  //         } else {
  //           blockOpt!.rows.forEach((row) => {
  //             row.eachCell((cell) => {
  //               if (typeof cell.value === 'string') {
  //                 cell.value = cell.value.replace('{{optionContent}}', 'Tự luận');
  //                 cell.value = cell.value.replace('{{selectedCount}}', String(ques.essayAnswers.length));
  //                 cell.value = cell.value.replace('{{#options}}', '');
  //                 cell.value = cell.value.replace('{{/options}}', '');
  //               }
  //             });
  //           });
  //         }
  //       }
  //       // 3. Cập nhật lại blockQues để chèn tiếp
  //       if (newBlockQues)
  //         blockQues = newBlockQues;
  //     })
  //   }

  //   // 4. Xuất file
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   saveAs(new Blob([buffer]), 'BaoCao.xlsx');
  // }







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

