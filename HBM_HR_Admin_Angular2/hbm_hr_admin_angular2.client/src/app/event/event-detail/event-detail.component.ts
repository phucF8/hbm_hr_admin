import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventItem, CreateEventRequest, UpdateEventRequest } from '@app/models/event.model';
import { EventService } from '@app/services/event.service';
import { FileService } from '@app/services/file.service';
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
  uploadedImageUrl: string | null = null; // Lưu URL của file đã upload
  iframeHtmlContent: SafeResourceUrl = '';
  backgroundImageUrl: string | null = null; // Full URL để user test
  previewHtmlBlobUrl: string | null = null; // Blob URL của HTML preview để user mở trong browser
  
  // Upload trực tiếp file sau khi chọn
  isUploadingImage: boolean = false;
  hasImageUploaded: boolean = false;
  imageUploadMessage: string = '';
  
  // Tạo file HTML
  isCreatingFile: boolean = false;

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
    // Update iframe content mỗi khi content hoặc image thay đổi
    this.eventForm.get('content')?.valueChanges.subscribe(() => {
      this.updateIframeContent();
    });
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
      priority: [0],
      htmlContent: [''] // Ẩn field dùng để lưu HTML content hoàn chỉnh
    });
  }

  loadEventData(event: EventItem): void {
    // Extract text content từ HTML document nếu có
    const htmlContent = event.content || event.htmlContent || '';
    const textContent = this.extractContentFromHtml(htmlContent);
    const extractedBackgroundUrl = this.extractBackgroundImageUrlFromHtml(htmlContent);

    this.eventForm.patchValue({
      title: event.title || '',
      content: textContent,
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
    this.backgroundImageUrl = this.previewUrl; // Lưu full URL để hiển thị cho user test
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
   * Upload file hình ảnh đã chọn lên server
   * Gọi API /Upload để lưu vào folder tmp
   * Sau đó gọi ViewFile để lấy blob đã giải mã
   */
  async uploadSelectedImage(): Promise<void> {
    if (!this.selectedImageFile) {
      Swal.fire('Lỗi', 'Vui lòng chọn hình ảnh trước', 'error');
      return;
    }

    this.isUploadingImage = true;
    this.imageUploadMessage = 'Đang upload...';

    try {
      // Upload file lên server (tmp folder)
      const response = await this.fileService.uploadFile(this.selectedImageFile).toPromise();
      console.log('[EventDetail] Upload response:', response);

      if (response && response.status === 'SUCCESS' && response.data) {
        let encryptedFileName = response.data.encryptedFileName;

        // Extract encryptedFileName từ response
        if (!encryptedFileName && response.data.url) {
          encryptedFileName = response.data.url.split('/').pop();
        }
        if (!encryptedFileName && response.data.filePath) {
          encryptedFileName = response.data.filePath.split('\\').pop() || response.data.filePath.split('/').pop();
        }

        if (!encryptedFileName) {
          throw new Error('Không thể extract tên file mã hóa từ response');
        }

        this.isUploadingImage = false;
        this.hasImageUploaded = true;
        // Lưu chỉ tên file, không lưu path
        const fileName = response.data.url?.split('/').pop() || response.data.url;
        this.uploadedImageUrl = fileName || null;
        this.imageUploadMessage = 'Upload thành công!';

        Swal.fire('Thành công', 'Đã upload hình ảnh', 'success');
        console.log('[EventDetail] Image uploaded successfully');
      } else {
        throw new Error(response?.message || 'Upload thất bại');
      }
    } catch (error: any) {
      console.error('[EventDetail] Upload error:', error);
      this.isUploadingImage = false;
      this.hasImageUploaded = false;
      this.uploadedImageUrl = null; // Reset uploaded URL khi upload thất bại
      this.imageUploadMessage = 'Upload thất bại';

      Swal.fire('Lỗi', error.message || 'Không thể upload hình ảnh', 'error');
    }
  }

  /**
   * Cập nhật nội dung iframe khi content hoặc image thay đổi
   * Tạo HTML document isolated khỏi CSS của page
   */
  private updateIframeContent(): void {
    const contentText = this.content?.value || '<p>Nội dung hiển thị sẽ xuất hiện tại đây</p>';
    const bgImage = this.previewUrl ? `url('${this.previewUrl}')` : 'none';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
          }
          body {
            background-image: ${bgImage};
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          .preview-overlay {
            width: 100%;
            height: 100%;
            padding: 20px;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45));
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .preview-content {
            word-break: break-word;
            color: white;
            text-align: center;
            font-size: 16px;
            line-height: 1.5;
            max-width: 90%;
          }
        </style>
      </head>
      <body>
        <div class="preview-overlay">
          <div class="preview-content">${this.escapeHtml(contentText)}</div>
        </div>
      </body>
      </html>
    `;
    
    // Sử dụng blob URL để load HTML content vào iframe
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    this.iframeHtmlContent = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
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
   * Extract text content từ HTML document
   * Parse HTML và lấy text từ .preview-content element
   */
  private extractContentFromHtml(html: string): string {
    if (!html || html.trim().length === 0) return '';

    // Tạo DOM parser để parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Tìm element có class preview-content
    const contentElement = doc.querySelector('.preview-content');
    if (contentElement) {
      // Decode HTML entities và return text content
      const textarea = document.createElement('textarea');
      textarea.innerHTML = contentElement.innerHTML;
      return textarea.value;
    }

    // Fallback: nếu không tìm thấy .preview-content, return raw text
    return html;
  }

  /**
   * Extract background-image URL từ HTML document
   * Tìm style background-image ở body hoặc inline style
   */
  private extractBackgroundImageUrlFromHtml(html: string): string | null {
    if (!html || html.trim().length === 0) return null;

    // Ưu tiên parse nhanh bằng regex để bắt cả CSS trong <style>
    const backgroundRegex = /background-image\s*:\s*url\((['"]?)(.*?)\1\)/i;
    const match = html.match(backgroundRegex);
    if (match && match[2]) {
      return match[2].trim();
    }

    return null;
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
   * Nếu đã upload qua uploadSelectedImage() thì skip
   * @returns Promise với blob URL của ảnh đã giải mã, hoặc null nếu không có file
   */
  private async uploadImageIfNeeded(): Promise<string | null> {
    // Nếu file đã được upload qua nút upload - sử dụng uploadedImageUrl
    if (this.hasImageUploaded && this.uploadedImageUrl) {
      console.log('[EventDetail] Using uploaded image URL:', this.uploadedImageUrl);
      return this.uploadedImageUrl;
    }

    // Nếu không có file mới, giữ nguyên URL cũ (nếu có)
    if (!this.selectedImageFile) {
      console.log('[EventDetail] No image file selected, using existing preview URL');
      return this.previewUrl;
    }

    // Upload file nếu user chọn nhưng chưa ấn nút upload (fallback scenario)
    try {
      console.log('[EventDetail] Uploading selected image (fallback - user forgot to click upload button)');
      const response = await this.fileService.uploadFile(this.selectedImageFile).toPromise();
      console.log('[EventDetail] Upload response:', response);
      
      if (response && response.status === 'SUCCESS' && response.data) {
        let encryptedFileName = response.data.encryptedFileName;
        
        // Nếu không có encryptedFileName, thử extract từ url hoặc filePath
        if (!encryptedFileName && response.data.url) {
          encryptedFileName = response.data.url.split('/').pop();
        }
        if (!encryptedFileName && response.data.filePath) {
          encryptedFileName = response.data.filePath.split('\\').pop() || response.data.filePath.split('/').pop();
        }

        if (!encryptedFileName) {
          throw new Error('Không thể extract tên file mã hóa từ response');
        }

        return encryptedFileName;
      }
      throw new Error('Upload thất bại');
    } catch (error: any) {
      console.error('[EventDetail] Upload error:', error);
      throw new Error(error.message || 'Không thể upload hình ảnh');
    }
  }

  /**
   * Tạo JSON content chứa uploadedImageUrl và content
   * Lưu vào database dưới dạng JSON string
   */
  private generateJsonContent(): string {
    const formValue = this.eventForm.value;
    
    const contentData = {
      uploadedImageUrl: this.uploadedImageUrl || null,
      content: formValue.content || ''
    };

    return JSON.stringify(contentData, null, 2);
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

  /**
   * Preview event content
   * Tạo JSON content từ form data
   */
  onPreview(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const jsonContent = this.generateJsonContent();
    
    // Lưu JSON content vào form control
    this.eventForm.patchValue({
      htmlContent: jsonContent
    });

    Swal.fire('Thông báo', 'Đã cập nhật JSON content:\n\n' + jsonContent, 'info');
  }

  /**
   * Mở file HTML preview trong tab browser mới
   */
  openPreviewInBrowser(): void {
    if (this.previewHtmlBlobUrl) {
      window.open(this.previewHtmlBlobUrl, '_blank');
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
  get startDate() { return this.eventForm.get('startDate'); }
  get endDate() { return this.eventForm.get('endDate'); }
  get orderNumber() { return this.eventForm.get('orderNumber'); }
  get isActive() { return this.eventForm.get('isActive'); }
  get version() { return this.eventForm.get('version'); }
  get priority() { return this.eventForm.get('priority'); }
  get htmlContent() { return this.eventForm.get('htmlContent'); }
}

