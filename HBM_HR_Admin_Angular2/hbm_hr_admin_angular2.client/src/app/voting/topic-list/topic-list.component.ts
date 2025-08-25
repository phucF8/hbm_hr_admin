import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VotingService } from '@app/services/voting.service';
import { Router } from '@angular/router';

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
    private http: HttpClient
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
    const userId = localStorage.getItem('userID') || '';
    this.votingService.getTopicsByUser(userId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status === 'SUCCESS') {
          this.topics = res.data;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching topics:', err);
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

  answerSurvey(topic: Topic) {
    //alert(`${topic.hasAnswered ? 'Chỉnh sửa câu trả lời' : 'Trả lời'}: ${topic.id}`);
this.router.navigate(['/voting',  topic.id]);
  }

}
