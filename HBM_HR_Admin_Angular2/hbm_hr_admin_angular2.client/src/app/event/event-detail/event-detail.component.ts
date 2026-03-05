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
 * Cho phép nhập HTML content và preview image
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
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      startDate: [null],
      endDate: [null],
      isActive: [true],
      orderNumber: [0]
    });
  }

  loadEventData(event: EventItem): void {
    this.eventForm.patchValue({
      title: event.title || '',
      content: event.content || '',
      imageUrl: event.imageUrl || '',
      startDate: event.startDate ? formatDate(event.startDate, 'yyyy-MM-dd', 'en') : null,
      endDate: event.endDate ? formatDate(event.endDate, 'yyyy-MM-dd', 'en') : null,
      isActive: event.isActive ?? true,
      orderNumber: event.orderNumber ?? 0
    });
  }

  /**
   * Submit form - tự động phân biệt Create/Update dựa vào isEditMode
   * Validate form trước khi gọi API
   */
  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.eventForm.value;

    if (this.isEditMode && this.data) {
      this.updateEvent(formValue);
    } else {
      this.createEvent(formValue);
    }
  }

  createEvent(formValue: any): void {
    const request: CreateEventRequest = {
      title: formValue.title,
      content: formValue.content,
      imageUrl: formValue.imageUrl || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      isActive: formValue.isActive,
      orderNumber: formValue.orderNumber || 0
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
      content: formValue.content,
      imageUrl: formValue.imageUrl || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      isActive: formValue.isActive,
      orderNumber: formValue.orderNumber || 0
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
  get imageUrl() { return this.eventForm.get('imageUrl'); }
  get startDate() { return this.eventForm.get('startDate'); }
  get endDate() { return this.eventForm.get('endDate'); }
  get isActive() { return this.eventForm.get('isActive'); }
  get orderNumber() { return this.eventForm.get('orderNumber'); }
}
