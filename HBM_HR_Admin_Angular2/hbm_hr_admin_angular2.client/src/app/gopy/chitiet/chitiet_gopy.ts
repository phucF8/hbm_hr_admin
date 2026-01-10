// src/app/components/gop-y-detail/gop-y-detail.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
// Giả định có các service này hoặc tự tạo
import { LoadingService } from '../../services/loading.service';
import { ErrorService } from '../../services/error.service';
import { ChiTietGopY, FileGopY } from '@app/models/gopy_chitiet.model';
import { GopYService } from '@app/services/gop-y.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFullImageUrl } from '@app/utils/url.utils';
import { environment } from 'environments/environment';
import { FileService } from '@app/services/file.service';

@Component({
    selector: 'app-gop-y-detail',
    standalone: true,
    templateUrl: './chitiet_gopy.html',
    styleUrls: ['./chitiet_gopy.css'],
    imports: [CommonModule], // Thêm CommonModule vào đây
})
export class GopYDetailComponent implements OnInit, OnChanges {

    errorMessage: string | null = null;

    constructor(
        private fileService: FileService,
        private gopYService: GopYService,
        private loadingService: LoadingService, // Inject LoadingService
        private errorService: ErrorService, // Inject ErrorService
        private dialogRef: MatDialogRef<GopYDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChiTietGopY
    ) { }

    ngOnInit(): void {
        // if (this.gopYId) {
        //     this.loadChiTietGopY(this.gopYId);
        // }
    }

    // Sử dụng OnChanges để tải lại dữ liệu nếu gopYId thay đổi từ component cha
    ngOnChanges(changes: SimpleChanges): void {

    }


    onClose() {
        this.dialogRef.close();
    }

    getAnh(anh: string) {
        return getFullImageUrl(anh);
    }

    getLinkFile(url: string): string {
        if (!url) return '#';
        // Nếu url là đường dẫn tương đối, hãy nối với Base URL của Server
        // Ví dụ: return `https://api.yourdomain.com/${url}`;
        // return `${environment.apiUrl}/${url}`;
        return url;
    }

    downloadFile(path: string) {
        // đang lấy từ server thật http://admin.hbm.vn:8088/
        // Nếu path chứa 'uploads/', lấy phần sau cùng. Nếu không, lấy toàn bộ path.
        const fileName = path.includes('uploads/')
            ? path.split('uploads/').pop() || ''
            : path;

        // 2. Gọi service để xử lý tải và mở file
        this.fileService.downloadAndOpenFile(fileName);
    }
}