import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuestionManagerComponent } from '@app/question-manager/question-manager.component';

interface Feedback {
  id: number;
  title: string;
  type: string;
  dateSubmitted: Date;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
}

@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.component.html',
  styleUrls: ['./feedback-management.component.css'],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
})
export class FeedbackManagementComponent implements OnInit {
  // Filter properties
  searchText: string = '';
  selectedType: string = '';
  selectedStatus: string = '';
  startDate: string = '';
  endDate: string = '';

  // Data properties
  feedbacks: Feedback[] = [
    {
      id: 1,
      title: 'Góp ý cải thiện giao diện website',
      type: 'Góp ý',
      dateSubmitted: new Date('2024-12-15'),
      status: 'pending'
    },
    {
      id: 2,
      title: 'Phản ánh lỗi đăng nhập',
      type: 'Báo lỗi',
      dateSubmitted: new Date('2024-12-14'),
      status: 'processing'
    },
    {
      id: 3,
      title: 'Đề xuất tính năng mới',
      type: 'Đề xuất tính năng',
      dateSubmitted: new Date('2024-12-13'),
      status: 'resolved'
    },
    {
      id: 4,
      title: 'Khiếu nại về dịch vụ',
      type: 'Khiếu nại',
      dateSubmitted: new Date('2024-12-12'),
      status: 'rejected'
    },
    {
      id: 5,
      title: 'Báo cáo vấn đề bảo mật',
      type: 'Báo mật',
      dateSubmitted: new Date('2024-12-11'),
      status: 'processing'
    }
  ];

  filteredFeedbacks: Feedback[] = [];

  ngOnInit(): void {
    this.filteredFeedbacks = [...this.feedbacks];
  }

  applyFilters(): void {
    this.filteredFeedbacks = this.feedbacks.filter(feedback => {
      const matchesSearch = !this.searchText ||
        feedback.title.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesType = !this.selectedType || feedback.type === this.selectedType;

      const matchesStatus = !this.selectedStatus || feedback.status === this.selectedStatus;

      const matchesStartDate = !this.startDate ||
        feedback.dateSubmitted >= new Date(this.startDate);

      const matchesEndDate = !this.endDate ||
        feedback.dateSubmitted <= new Date(this.endDate);

      return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.searchText = '';
    this.startDate = '';
    this.endDate = '';
    this.filteredFeedbacks = [...this.feedbacks];
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'resolved': 'Đã giải quyết',
      'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
  }

  viewFeedback(id: number): void {
    console.log('View feedback:', id);
  }

  editFeedback(id: number): void {
    console.log('Edit feedback:', id);
  }

  deleteFeedback(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa ý kiến này?')) {
      this.feedbacks = this.feedbacks.filter(f => f.id !== id);
      this.applyFilters();
    }
  }
}