import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Attachment {
  name: string;
  size: string;
  type: string;
}

interface Opinion {
  code: string;
  title: string;
  content: string;
  sentDate: string;
  status: string;
  lastUpdate: string;
  attachments: Attachment[];
  response?: string;
}

@Component({
  selector: 'app-opinion-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './feedback-detail.component.html',
  styleUrls: ['./feedback-detail.component.css']
})
export class OpinionDetailComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() opinionId?: string;
  @Output() closeEvent = new EventEmitter<void>();

  opinion: Opinion = {
    code: '#OP-2024-001',
    title: 'Đề xuất cải tiến quy trình làm việc',
    content: `Kính gửi Ban lãnh đạo công ty,
Tôi xin được đề xuất một số cải tiến cho quy trình làm việc hiện tại nhằm nâng cao hiệu quả và giảm thiểu thời gian xử lý công việc:
1. Áp dụng hệ thống quản lý tài liệu điện tử thống nhất
2. Tự động hóa quy trình phê duyệt cho các yêu cầu thường xuyên
3. Thiết lập dashboard theo dõi tiến độ công việc real-time
Tôi tin rằng những cải tiến này sẽ giúp tăng năng suất lên 30% và giảm thời gian xử lý từ 5 ngày xuống còn 2 ngày.`,
    sentDate: '15/09/2024, 09:30',
    status: 'reviewed',
    lastUpdate: '16/09/2024, 14:20',
    attachments: [
      { name: 'Bản đề xuất chi tiết.pdf', size: '2.5 MB', type: 'pdf' },
      { name: 'Sơ đồ quy trình mới.png', size: '1.8 MB', type: 'image' },
      { name: 'Phân tích ROI.xlsx', size: '850 KB', type: 'excel' }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    // Load opinion data based on opinionId if provided
    if (this.opinionId) {
      this.loadOpinionData(this.opinionId);
    }
  }

  loadOpinionData(id: string): void {
    // TODO: Implement API call to load opinion data
    // Example:
    // this.opinionService.getOpinionById(id).subscribe(data => {
    //   this.opinion = data;
    // });
  }

  closeModal(): void {
    this.isOpen = false;
    this.closeEvent.emit();
  }

  downloadAttachment(attachment: Attachment): void {
    // TODO: Implement file download logic
    console.log('Downloading:', attachment.name);
  }
}