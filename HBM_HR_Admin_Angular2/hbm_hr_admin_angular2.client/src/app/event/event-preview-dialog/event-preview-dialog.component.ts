import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-preview-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-preview-dialog.component.html',
  styleUrls: ['./event-preview-dialog.component.css']
})
export class EventPreviewDialogComponent {
  iframeSrc: SafeResourceUrl;
  event: EventItem;
  showMetadata: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<EventPreviewDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: { event: EventItem }
  ) {
    this.event = data.event;
    
    // Tạo blob URL từ HTML content
    const htmlContent = this.event.generatedHtml || '';
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
  }

  toggleMetadata(): void {
    this.showMetadata = !this.showMetadata;
  }

  close(): void {
    this.dialogRef.close();
  }

  // Helper methods để format data
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'Không giới hạn';
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(): string {
    return this.event.isActive ? 'Đang hoạt động' : 'Tạm dừng';
  }

  getStatusClass(): string {
    return this.event.isActive ? 'status-active' : 'status-inactive';
  }

  formatJson(): string {
    try {
      const json = JSON.parse(this.event.htmlContent || this.event.content || '{}');
      return JSON.stringify(json, null, 2);
    } catch {
      return this.event.htmlContent || this.event.content || '{}';
    }
  }
}
