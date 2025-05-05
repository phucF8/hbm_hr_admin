import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-xuat-file',
  templateUrl: './xuat-file.component.html',
  styleUrls: ['./xuat-file.component.css'],
  standalone: false,
})
export class XuatFileComponent {
  xuatFileForm: FormGroup;
  currentPage: number = 1;  // Trang hiện tại (nhận từ data)

  fromPage?: string;
  toPage?: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<XuatFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.currentPage) {
      this.currentPage = data.currentPage;
    }

    // Khởi tạo form group
    this.xuatFileForm = this.fb.group({
      exportOption: ['current', Validators.required],
      fromPage: [1],
      toPage: [1],
      pageList: ['']
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.xuatFileForm.valid) {
      const result = {
        exportOption: this.xuatFileForm.get('exportOption')?.value,
        currentPage: this.currentPage,
        fromPage: this.xuatFileForm.get('fromPage')?.value,
        toPage: this.xuatFileForm.get('toPage')?.value,
        pageList: this.xuatFileForm.get('pageList')?.value
      };
      this.dialogRef.close(result);
    }
  }
}
