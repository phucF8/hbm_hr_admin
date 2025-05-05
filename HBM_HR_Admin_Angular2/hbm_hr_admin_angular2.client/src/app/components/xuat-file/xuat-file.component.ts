import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DebugUtils } from '@app/utils/debug-utils';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';



@Component({
  selector: 'app-xuat-file',
  templateUrl: './xuat-file.component.html',
  styleUrls: ['./xuat-file.component.css'],
  standalone: false,
})
export class XuatFileComponent {
  xuatFileForm: FormGroup;
  currentPage: number = 1;  // Trang hiện tại (nhận từ data)

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<XuatFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.currentPage) {
      this.currentPage = data.currentPage;
    }

    this.xuatFileForm = this.fb.group({
      exportOption: ['current', Validators.required],
      fromPage: [1],
      toPage: [1],
      pageList: ['']
    }, { validators: [this.fromPageLessThanToPage, this.validatePageListIfListOption] });

  }

  fromPageLessThanToPage(group: AbstractControl): ValidationErrors | null {
    const exportOption = group.get('exportOption')?.value;
    const fromPage = group.get('fromPage')?.value;
    const toPage = group.get('toPage')?.value;
    if (exportOption === 'range') {
      if (fromPage != null && toPage != null && fromPage > toPage) {
        return { fromPageGreaterThanToPage: true };
      }
    }
    return null;
  }

  validatePageListIfListOption(group: AbstractControl): ValidationErrors | null {
    const exportOption = group.get('exportOption')?.value;
    const pageList = group.get('pageList')?.value;
  
    if (exportOption === 'list') {
      const pattern = /^(\d+,)*\d+$/;
      if (!pattern.test(pageList)) {
        return { invalidPageList: true };
      }
    }
    return null;
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
        pageList: this.xuatFileForm.get('pageList')?.value,
      };
      //DebugUtils.openStringInNewWindow(`${ JSON.stringify(result) }`);
      this.dialogRef.close(result);
    } else if (this.xuatFileForm.invalid) {
      this.xuatFileForm.markAllAsTouched();
      return;
    }
  }
}
