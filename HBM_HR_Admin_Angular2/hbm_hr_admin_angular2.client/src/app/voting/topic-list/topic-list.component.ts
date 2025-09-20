import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VotingService } from '@app/services/voting.service';
import { Router } from '@angular/router';
import { SurveyDetailReportComponent } from '@app/survey/survey-detail-report/survey-detail-report.component';
import { MatDialog } from '@angular/material/dialog';
import { SurveyReviewComponent } from '@app/survey/survey-review/survey-review.component';
import { VotingModule } from '../voting-module';
import { VotePageComponent } from '../vote-page/vote-page.component';
import { showApiBusinessError, showApiError, showJsonDebug } from '@app/utils/error-handler';

interface Topic {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  hasAnswered: boolean;
  questions: any[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: Topic[];
}

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-list.component.html',
  styleUrls: ['./topic-list.component.css']
})
export class TopicListComponent implements OnInit {
  loading = true;
  topics: Topic[] = [];
  errorMessage = '';

  constructor(
    private router: Router,
    private votingService: VotingService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchTopics();
    // .subscribe({
    //   next: (res) => {
    //     this.loading = false;
    //     if (res.status === 'SUCCESS' && res.data.length > 0) {
    //       this.topics = res.data;
    //     }
    //   },
    //   error: (err) => {
    //     this.loading = false;
    //     this.errorMessage = 'Không thể tải dữ liệu.';
    //     console.error(err);
    //   }
    // });

  }

  fetchTopics() {
    const idUser = localStorage.getItem('id') || '';
    const idKhoLamViec = localStorage.getItem('idKhoLamViec') || '';
    this.votingService.getTopicsByUser(idUser, idKhoLamViec).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status === 'SUCCESS') {
          this.topics = res.data;
          showJsonDebug(res.data);
        } else {
          showApiBusinessError(res.message, 'Tải danh sách phiếu điều tra thất bại');
        }
      },
      error: (err) => {
        this.loading = false;
        showApiError(err);
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  // 👉 Khi mở survey chi tiết, giao diện sẽ hiển thị theo 2 trường hợp:
  // Nếu người dùng đã trả lời → hiển thị giao diện chỉ để xem lại (review) câu trả lời.
  // Nếu người dùng chưa trả lời → hiển thị giao diện để thực hiện trả lời.
  goToDetailSurvey(topic: Topic) {
    if (topic.hasAnswered) {
      const dialogRef = this.dialog.open(SurveyReviewComponent, {
        data: { topicId: topic.id },
        disableClose: true,
        panelClass: 'err-report-detail-dialog',
        width: '60vw',
        height: '100vh',
        maxWidth: '100vw'
      });
    } else {
      const dialogRef = this.dialog.open(VotePageComponent, {
        data: { topicId: topic.id },
        disableClose: true,
        panelClass: 'err-report-detail-dialog',
        width: '60vw',
        height: '100vh',
        maxWidth: '100vw'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fetchTopics();
        }
      });
    }

  }

}
