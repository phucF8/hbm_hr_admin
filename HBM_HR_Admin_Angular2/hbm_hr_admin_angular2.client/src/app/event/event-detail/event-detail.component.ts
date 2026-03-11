import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventItem, CreateEventRequest, UpdateEventRequest } from '@app/models/event.model';
import { EventService } from '@app/services/event.service';
import { FileService } from '@app/services/file.service';
import Swal from 'sweetalert2';
import { debounceTime, Subject } from 'rxjs';

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

  readonly defaultTextSize = 16;
  readonly defaultTextColor = '#ffffff';

  eventForm!: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  selectedImageName: string = '';
  previewUrl: string | null = null;
  selectedImageFile: File | null = null;
  uploadedImageUrl: string | null = null; // Lưu URL của file đã upload
  iframeHtmlContent: SafeResourceUrl = '';
  
  // Upload trực tiếp file sau khi chọn
  isUploadingImage: boolean = false;
  hasImageUploaded: boolean = false;
  imageUploadMessage: string = '';
  
  // Tạo file HTML
  isCreatingFile: boolean = false;
  
  // Subject cho debounce update preview
  private previewUpdate$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private fileService: FileService,
    private dialogRef: MatDialogRef<EventDetailComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: EventItem | null
  ) {
    // Nếu có data truyền vào = Edit mode, không có = Create mode
    this.isEditMode = !!data;
    this.initForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.loadEventData(this.data);
    } else {
      // Cập nhật iframe content lần đầu cho create mode
      this.updateIframeContent();
    }
    
    this.registerPreviewSubscriptions();
    
    // Subscribe vào debounced preview updates
    this.previewUpdate$.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.updateIframeContent();
    });
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      textSize: [this.defaultTextSize, [Validators.required, Validators.min(10), Validators.max(72)]],
      textColor: [this.defaultTextColor, [Validators.required]],
      isBold: [false],
      isItalic: [false],
      startDate: [null, Validators.required],
      endDate: [null],
      orderNumber: [0],
      isActive: [true],
      version: [1],
      priority: [0],
      htmlContent: [''] // Ẩn field dùng để lưu HTML content hoàn chỉnh
    });
  }

  private registerPreviewSubscriptions(): void {
    ['content', 'textSize', 'textColor', 'isBold', 'isItalic'].forEach(controlName => {
      this.eventForm.get(controlName)?.valueChanges.subscribe(() => {
        this.previewUpdate$.next();
      });
    });
  }

  loadEventData(event: EventItem): void {
    // Extract text content từ HTML document nếu có
    const htmlContent = event.content || event.htmlContent || '';
    const textContent = this.extractContentFromHtml(htmlContent);
    const extractedBackgroundUrl = this.extractBackgroundImageUrlFromHtml(htmlContent);
    const textStyles = this.extractTextStyleSettingsFromHtml(htmlContent);

    this.eventForm.patchValue({
      title: event.title || '',
      content: textContent,
      textSize: textStyles.textSize,
      textColor: textStyles.textColor,
      isBold: textStyles.isBold,
      isItalic: textStyles.isItalic,
      startDate: this.formatDateForInput((event.startDate || event.startTime) ?? null),
      endDate: this.formatDateForInput((event.endDate || event.endTime) ?? null),
      orderNumber: event.priority || 0,
      isActive: event.isActive ?? true,
      version: event.version ?? 1,
      priority: event.priority ?? 0
    });

    // Ưu tiên imageUrl từ API, nếu không có thì lấy từ htmlContent
    this.previewUrl = event.imageUrl || extractedBackgroundUrl;
    this.uploadedImageUrl = null; // Reset upload URL khi load event cũ
    if (this.previewUrl) {
      this.selectedImageName = this.extractFileNameFromUrl(this.previewUrl);
    }

    // Update iframe content sau khi load data
    this.updateIframeContent();
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
      this.hasImageUploaded = false; // Reset upload status khi chọn file mới
      this.uploadedImageUrl = null; // Reset uploaded URL khi chọn file mới

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
        this.updateIframeContent();
      };
      reader.readAsDataURL(file);
    }
  }



  /**
   * Cập nhật nội dung iframe khi content hoặc image thay đổi
   * Gọi backend API để generate HTML (single source of truth)
   */
  private updateIframeContent(): void {
    // Tạo JSON content từ form values
    const jsonContent = this.buildPreviewJsonContent();
    
    // Gọi backend API để generate HTML
    this.eventService.generatePreviewHtml(jsonContent).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data) {
          const htmlContent = response.data.html;
          
          // Sử dụng blob URL để load HTML content vào iframe
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          this.iframeHtmlContent = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        }
      },
      error: (error) => {
        console.error('[EventDetail] Failed to generate preview HTML:', error);
      }
    });
  }

  /**
   * Tạo JSON content cho preview từ form values
   * Dùng previewUrl (data URL) cho live preview, hoặc uploadedImageUrl nếu đã upload
   */
  private buildPreviewJsonContent(): string {
    const contentData = {
      uploadedImageUrl: this.previewUrl || null,
      content: this.content?.value || '',
      textSize: this.textSize?.value || this.defaultTextSize,
      textColor: this.textColor?.value || this.defaultTextColor,
      isBold: !!this.isBoldControl?.value,
      isItalic: !!this.isItalicControl?.value
    };
    return JSON.stringify(contentData);
  }

  /**
   * Escape HTML special characters để tránh XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Extract text content từ HtmlContent JSON
   * Parse JSON và lấy thuộc tính "content"
   */
  private extractContentFromHtml(html: string): string {
    if (!html || html.trim().length === 0) return '';

    try {
      // Parse JSON từ HtmlContent
      const jsonData = JSON.parse(html);
      
      // Lấy thuộc tính content
      if (jsonData.content && typeof jsonData.content === 'string') {
        return jsonData.content;
      }
    } catch (error) {
      console.warn('[EventDetail] Cannot parse HtmlContent as JSON, trying HTML fallback:', error);
      
      // Fallback: parse như HTML document (backward compatibility)
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const contentElement = doc.querySelector('.preview-content');
        if (contentElement) {
          const textarea = document.createElement('textarea');
          textarea.innerHTML = contentElement.innerHTML;
          return textarea.value;
        }
      } catch {}
    }

    return '';
  }

  /**
   * Extract background-image URL từ HtmlContent JSON
   * Parse JSON và lấy thuộc tính "uploadedImageUrl"
   */
  private extractBackgroundImageUrlFromHtml(html: string): string | null {
    if (!html || html.trim().length === 0) return null;

    try {
      // Parse JSON từ HtmlContent
      const jsonData = JSON.parse(html);
      
      // Lấy thuộc tính uploadedImageUrl
      if (jsonData.uploadedImageUrl && typeof jsonData.uploadedImageUrl === 'string') {
        return jsonData.uploadedImageUrl;
      }
    } catch (error) {
      console.warn('[EventDetail] Cannot parse HtmlContent as JSON, trying HTML fallback:', error);
      
      // Fallback: parse bằng regex từ HTML (backward compatibility)
      const backgroundRegex = /background-image\s*:\s*url\((['"]?)(.*?)\1\)/i;
      const match = html.match(backgroundRegex);
      if (match && match[2]) {
        return match[2].trim();
      }
    }

    return null;
  }

  /**
   * Extract text style settings từ HtmlContent JSON.
   */
  private extractTextStyleSettingsFromHtml(html: string): { textSize: number; textColor: string; isBold: boolean; isItalic: boolean } {
    const defaults = {
      textSize: this.defaultTextSize,
      textColor: this.defaultTextColor,
      isBold: false,
      isItalic: false
    };

    if (!html || html.trim().length === 0) {
      return defaults;
    }

    try {
      const jsonData = JSON.parse(html);
      return {
        textSize: this.normalizeTextSize(jsonData.textSize),
        textColor: this.normalizeTextColor(jsonData.textColor),
        isBold: !!jsonData.isBold,
        isItalic: !!jsonData.isItalic
      };
    } catch {
      return defaults;
    }
  }

  private normalizeTextSize(value: unknown): number {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.min(72, Math.max(10, Math.round(parsed)));
    }

    return this.defaultTextSize;
  }

  private normalizeTextColor(value: unknown): string {
    if (typeof value === 'string' && /^#([0-9a-fA-F]{6})$/.test(value.trim())) {
      return value.trim();
    }

    return this.defaultTextColor;
  }

  /**
   * Lấy tên file từ URL để hiển thị trên form
   */
  private extractFileNameFromUrl(url: string): string {
    try {
      const cleanUrl = url.split('?')[0].split('#')[0];
      const fileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
      return decodeURIComponent(fileName) || cleanUrl;
    } catch {
      return url;
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

    // Upload ảnh trước (nếu có), sau đó mới create/update event
    this.uploadImageIfNeeded().then(imageUrl => {
      // Cập nhật htmlContent trước khi submit nếu chưa có
      if (!formValue.htmlContent) {
        const jsonContent = this.generateJsonContent();
        this.eventForm.patchValue({
          htmlContent: jsonContent
        }, { emitEvent: false });
        formValue.htmlContent = jsonContent;
      }

      if (this.isEditMode && this.data) {
        this.updateEvent(formValue, imageUrl);
      } else {
        this.createEvent(formValue, imageUrl);
      }
    }).catch(error => {
      this.isSubmitting = false;
      Swal.fire('Lỗi', error.message || 'Không thể upload hình ảnh', 'error');
    });
  }

  /**
   * Upload ảnh lên server nếu user đã chọn file mới
   * Flow:
   * 1. Nếu đã upload qua nút upload → dùng uploadedImageUrl
   * 2. Nếu chọn file nhưng chưa upload → tự động upload khi submit: (main flow)
   * 3. Nếu không chọn file → dùng preview URL cũ (hoặc null)
   * @returns Promise với fileName của ảnh, hoặc null nếu không có file
   */
  private async uploadImageIfNeeded(): Promise<string | null> {
    // Flow 1: File đã được upload qua nút "Upload file lên tmp"
    if (this.hasImageUploaded && this.uploadedImageUrl) {
      console.log('[EventDetail] Using already uploaded image URL:', this.uploadedImageUrl);
      return this.uploadedImageUrl;
    }

    // Flow 2: User chọn file nhưng chưa upload → tự động upload khi submit
    if (this.selectedImageFile) {
      try {
        console.log('[EventDetail] Auto-uploading selected image during submit');
        const response = await this.fileService.uploadFileUnencrypted(this.selectedImageFile).toPromise();
        console.log('[EventDetail] Auto-upload response:', response);
        
        if (response && response.status === 'SUCCESS' && response.data) {
          let fileName = response.data.fileName || response.data.url?.split('/').pop();
          
          if (!fileName) {
            throw new Error('Không thể extract tên file từ response');
          }

          // Cập nhật state cho consistency
          this.uploadedImageUrl = fileName;
          this.hasImageUploaded = true;
          
          return fileName;
        }
        throw new Error('Upload thất bại');
      } catch (error: any) {
        console.error('[EventDetail] Auto-upload error:', error);
        throw new Error(error.message || 'Không thể upload hình ảnh');
      }
    }

    // Flow 3: Không có file mới, giữ nguyên URL cũ (nếu có)
    console.log('[EventDetail] No image file selected, using existing preview URL');
    return this.previewUrl;
  }

  /**
   * Tạo JSON content chứa uploadedImageUrl và content
   * Lưu vào database dưới dạng JSON string
   */
  private generateJsonContent(): string {
    const formValue = this.eventForm.value;
    
    const contentData = {
      uploadedImageUrl: this.uploadedImageUrl || null,
      content: formValue.content || '',
      textSize: this.normalizeTextSize(formValue.textSize),
      textColor: this.normalizeTextColor(formValue.textColor),
      isBold: !!formValue.isBold,
      isItalic: !!formValue.isItalic
    };

    return JSON.stringify(contentData, null, 2);
  }

  toggleTextStyle(controlName: 'isBold' | 'isItalic'): void {
    const control = this.eventForm.get(controlName);
    if (!control) {
      return;
    }

    control.setValue(!control.value);
  }

  createEvent(formValue: any, imageUrl: string | null): void {
    const request: CreateEventRequest = {
      title: formValue.title,
      htmlContent: formValue.htmlContent, // Sử dụng HTML content từ form
      startTime: new Date(formValue.startDate).toISOString(),
      endTime: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
      isActive: formValue.isActive,
      version: formValue.version || 1,
      priority: formValue.priority || 0,
      imageUrl: imageUrl || undefined
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

  updateEvent(formValue: any, imageUrl: string | null): void {
    const request: UpdateEventRequest = {
      id: this.data!.id,
      title: formValue.title,
      htmlContent: formValue.htmlContent, // Sử dụng HTML content từ form
      startTime: new Date(formValue.startDate).toISOString(),
      endTime: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
      isActive: formValue.isActive,
      version: formValue.version || 1,
      priority: formValue.priority || 0,
      imageUrl: imageUrl || undefined
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

  /**
   * Mở URL ảnh trong browser tab mới để user test sự tồn tại
   */
  openImageInBrowser(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
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
  get textSize() { return this.eventForm.get('textSize'); }
  get textColor() { return this.eventForm.get('textColor'); }
  get isBoldControl() { return this.eventForm.get('isBold'); }
  get isItalicControl() { return this.eventForm.get('isItalic'); }
  get startDate() { return this.eventForm.get('startDate'); }
  get endDate() { return this.eventForm.get('endDate'); }
  get orderNumber() { return this.eventForm.get('orderNumber'); }
  get isActive() { return this.eventForm.get('isActive'); }
  get version() { return this.eventForm.get('version'); }
  get priority() { return this.eventForm.get('priority'); }
  get htmlContent() { return this.eventForm.get('htmlContent'); }
}

