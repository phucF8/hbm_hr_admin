import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '@app/services/error.service';
import { VotingService } from '@app/services/voting.service';

interface OptionDto {
  id: string;
  content: string;
  orderNumber: number;
  selectedCount: number;
}

interface EssayAnswerDto {
  userId: string;
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

interface TopicReportDto {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  hasAnswered: boolean;
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
    private router: Router,
    private route: ActivatedRoute,
    private votingService: VotingService,
    private errorService: ErrorService,
    private http: HttpClient) {
    this.topicId = this.route.snapshot.paramMap.get('topicId')!;
  }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.votingService.getSurveyDetailReport(this.topicId).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.topicReport = res.data;
        } else {
          this.errorService.showError([res.message || 'Không tải được báo cáo']);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi load báo cáo:', err);
        this.errorService.showError([JSON.stringify(err)]);
        this.loading = false;
      }
    });
  }

}

