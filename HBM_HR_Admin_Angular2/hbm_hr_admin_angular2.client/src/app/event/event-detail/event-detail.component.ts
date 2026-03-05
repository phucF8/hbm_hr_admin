import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventItem, CreateEventRequest, UpdateEventRequest } from '@app/models/event.model';
import { EventService } from '@app/services/event.service';
import Swal from 'sweetalert2';

/**
 * Component dialog để tạo mới hoặc chỉnh sửa Event
 * Sử dụng Reactive Forms với validation
 * Fields khớp với backend API: Title, HtmlContent, IsActive, Version, StartTime, EndTime, Priority
 */
@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {

  eventForm!: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private dialogRef: MatDialogRef<EventDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventItem | null
  ) {
    // Nếu có data truyền vào = Edit mode, không có = Create mode
    this.isEditMode = !!data;
    this.initForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.loadEventData(this.data);
    }
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      htmlContent: ['', [Validators.required, Validators.minLength(10)]],
      startTime: [null, Validators.required],
      endTime: [null],
      isActive: [true],
      version: [1],
      priority: [0]
    });
  }

  loadEventData(event: EventItem): void {
    this.eventForm.patchValue({
      title: event.title || '',
      htmlContent: event.htmlContent || '',
      startTime: event.startTime ? this.formatDateTimeForInput(event.startTime) : null,
      endTime: event.endTime ? this.formatDateTimeForInput(event.endTime) : null,
      isActive: event.isActive ?? true,
      version: event.version ?? 1,
      priority: event.priority ?? 0
    });
  }

  /**
   * Format Date/string to ISO string format cho datetime-local input
   */
  private formatDateTimeForInput(date: string | Date | null): string | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Submit form - tự động phân biệt Create/Update dựa vào isEditMode
   * Validate form và các tham số trước khi gọi API
   */
  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const formValue = this.eventForm.value;
    
    // Validate EndTime > StartTime
    if (formValue.endTime && new Date(formValue.endTime) <= new Date(formValue.startTime)) {
      Swal.fire('Lỗi', 'EndTime phải lớn hơn StartTime', 'error');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.data) {
      this.updateEvent(formValue);
    } else {
      this.createEvent(formValue);
    }
  }

  createEvent(formValue: any): void {
    const request: CreateEventRequest = {
      title: formValue.title,
      htmlContent: formValue.htmlContent,
      startTime: new Date(formValue.startTime).toISOString(),
      endTime: formValue.endTime ? new Date(formValue.endTime).toISOString() : undefined,
      isActive: formValue.isActive,
      version: formValue.version || 1,
      priority: formValue.priority || 0
    };

    this.eventService.createEvent(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === 'SUCCESS') {
          Swal.fire('Thành công', 'Đã tạo event mới', 'success');
          this.dialogRef.close(true);
        } else {
          Swal.fire('Lỗi', response.message, 'error');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        Swal.fire('Lỗi', error.message || 'Không thể tạo event', 'error');
      }
    });
  }

  updateEvent(formValue: any): void {
    const request: UpdateEventRequest = {
      id: this.data!.id,
      title: formValue.title,
      htmlContent: formValue.htmlContent,
      startTime: new Date(formValue.startTime).toISOString(),
      endTime: formValue.endTime ? new Date(formValue.endTime).toISOString() : undefined,
      isActive: formValue.isActive,
      version: formValue.version || 1,
      priority: formValue.priority || 0
    };

    this.eventService.updateEvent(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === 'SUCCESS') {
          Swal.fire('Thành công', 'Đã cập nhật event', 'success');
          this.dialogRef.close(true);
        } else {
          Swal.fire('Lỗi', response.message, 'error');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        Swal.fire('Lỗi', error.message || 'Không thể cập nhật event', 'error');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  /** Đánh dấu tất cả controls là touched để hiện error message */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters để truy cập form controls trong template
  get title() { return this.eventForm.get('title'); }
  get htmlContent() { return this.eventForm.get('htmlContent'); }
  get startTime() { return this.eventForm.get('startTime'); }
  get endTime() { return this.eventForm.get('endTime'); }
  get isActive() { return this.eventForm.get('isActive'); }
  get version() { return this.eventForm.get('version'); }
  get priority() { return this.eventForm.get('priority'); }
}

