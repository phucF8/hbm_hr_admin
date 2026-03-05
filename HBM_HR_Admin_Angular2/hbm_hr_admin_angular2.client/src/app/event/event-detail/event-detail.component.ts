import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selectedImageName: string = '';
  previewUrl: string | null = null;
  selectedImageFile: File | null = null;

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
      content: ['', [Validators.required, Validators.minLength(10)]],
      startDate: [null, Validators.required],
      endDate: [null],
      orderNumber: [0],
      isActive: [true],
      version: [1],
      priority: [0]
    });
  }

  loadEventData(event: EventItem): void {
    this.eventForm.patchValue({
      title: event.title || '',
      content: event.content || event.htmlContent || '',
      startDate: this.formatDateForInput((event.startDate || event.startTime) ?? null),
      endDate: this.formatDateForInput((event.endDate || event.endTime) ?? null),
      orderNumber: event.priority || 0,
      isActive: event.isActive ?? true,
      version: event.version ?? 1,
      priority: event.priority ?? 0
    });
    
    // Set preview URL nếu event có imageUrl
    if (event.imageUrl) {
      this.previewUrl = event.imageUrl;
    }
  }

  /**
   * Format Date/string to YYYY-MM-DD format cho input type="date"
   */
  private formatDateForInput(date: string | Date | null): string | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Xử lý khi người dùng chọn file hình ảnh
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire('Lỗi', 'Vui lòng chọn file ảnh', 'error');
        input.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Lỗi', 'Kích thước ảnh không được vượt quá 5MB', 'error');
        input.value = '';
        return;
      }

      this.selectedImageFile = file;
      this.selectedImageName = file.name;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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
    
    // Validate endDate > startDate
    if (formValue.endDate && new Date(formValue.endDate) <= new Date(formValue.startDate)) {
      Swal.fire('Lỗi', 'Ngày kết thúc phải lớn hơn ngày bắt đầu', 'error');
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
      htmlContent: formValue.content, // Map content -> htmlContent for API
      startTime: new Date(formValue.startDate).toISOString(),
      endTime: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
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
      htmlContent: formValue.content, // Map content -> htmlContent for API
      startTime: new Date(formValue.startDate).toISOString(),
      endTime: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
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
  get content() { return this.eventForm.get('content'); }
  get previewHtmlContent(): string {
    const value = this.content?.value;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return '<p>Nội dung hiển thị sẽ xuất hiện tại đây</p>';
  }
  get startDate() { return this.eventForm.get('startDate'); }
  get endDate() { return this.eventForm.get('endDate'); }
  get orderNumber() { return this.eventForm.get('orderNumber'); }
  get isActive() { return this.eventForm.get('isActive'); }
  get version() { return this.eventForm.get('version'); }
  get priority() { return this.eventForm.get('priority'); }
}

