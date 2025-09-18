import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TopicDetailComponent } from '@app/voting/topic-detail/topic-detail.component';
import { TopicDetail } from '@app/voting/voting-list/responses/topic-detail.model';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';
import { ToastrService } from 'ngx-toastr';

import { MatTabGroup } from '@angular/material/tabs';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ChiNhanh, ChiNhanhService } from '@app/services/chi-nhanh.service';
import { TreeViewChecklistComponent } from "@app/uicomponents/tree-view-checklist/tree-view-checklist.component";
import { SearchUserFormComponent } from '@app/uicomponents/search-user-form/search-user-form.component';


@Component({
  selector: 'app-topic-release',
  imports: [
    CommonModule, // đã bao gồm CommonModule
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule, // cần cho <mat-tab-group>, <mat-tab>
    MatCheckboxModule, // cần cho <mat-checkbox>
    MatInputModule,
    TreeViewChecklistComponent,
    SearchUserFormComponent,
  ],
  templateUrl: './topic-release.component.html',
  styleUrl: './topic-release.component.css'
})
export class TopicReleaseComponent {
[x: string]: any;

  myForm!: FormGroup;
  selectedType: 'PhongBan' | 'ChucDanh' = 'PhongBan';
  departments = [
    { id: 1, name: 'Phòng Kinh doanh', selected: false },
    { id: 2, name: 'Phòng Nhân sự', selected: false },
    { id: 3, name: 'Phòng IT', selected: false },
  ];

  positions = [
    { id: 1, name: 'Trưởng phòng', selected: false },
    { id: 2, name: 'Nhân viên', selected: false },
    { id: 3, name: 'Thực tập sinh', selected: false },
  ];

  chiNhanhs: ChiNhanh[] = [];
  showDonvi = false;
  showNhanSu = true;

  // Lấy instance của component con
  @ViewChild(TreeViewChecklistComponent)
  treeViewComp!: TreeViewChecklistComponent;

  constructor(
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef,
    private service: VotingListService,
    private chiNhanhService: ChiNhanhService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TopicDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public topic: TopicDetail
  ) {
    this.myForm = this.fb.group({
      targets: this.fb.array([
        this.createTarget()
      ])
    });
    // this.questionsArray = this.myForm.get('questions') as FormArray;

    // if (data) {
    //   this.myForm.patchValue({
    //     title: data.title || '',
    //     description: data.description || '',
    //     startDate: data.startDate ? formatDate(data.startDate, 'yyyy-MM-dd', 'en') : null,
    //     endDate: data.endDate ? formatDate(data.endDate, 'yyyy-MM-dd', 'en') : null,
    //   });
    //   this.loadedQuestions = data.questions || [];
    //   this.loadedQuestions.forEach(q => {
    //     this.questionsArray.push(this.createQuestionFormGroup(q));
    //   });
    // }

    this.loadChiNhanhs();

  }

  loadChiNhanhs() {
    this.chiNhanhService.getChiNhanhs().subscribe({
      next: (data) => {
        this.chiNhanhs = data;
        if (this.treeViewComp) {
          this.treeViewComp.buildTree(data);
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API', err);
      }
    });
  }

  showChonNhanSu() {
    this.showDonvi = false;
    this.showNhanSu = true;
  }

  showChonDonVi() {
    this.showDonvi = true;
    this.showNhanSu = false;
  }

  ngTaoSelected(users: any[]) {
    
  }


  // Hàm tạo cặp targetType + targetId
  createTarget(): FormGroup {
    return this.fb.group({
      targetType: ['', [Validators.required, Validators.minLength(3)]],
      targetId: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Getter để dễ truy cập trong template
  get targets(): FormArray {
    return this.myForm.get('targets') as FormArray;
  }

  // Thêm 1 cặp target mới
  addTarget() {
    (this.myForm.get('targets') as FormArray).push(this.createTarget());
    // this.targets.push(this.createTarget());
  }

  // Xóa 1 cặp target
  removeTarget(index: number) {
    this.targets.removeAt(index);
  }

  onSubmitRelease() {
    const donviSelecteds = this.treeViewComp.getSelected();
    if (donviSelecteds.length <= 0) return;
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Không tìm thấy userID trong localStorage!');
      return;
    }
    const newReleases = donviSelecteds.map((item: any) => ({
      topicId: this.topic.id,
      targetType: 'DONVI',
      targetId: item.tag.id,
      releasedBy: userID,
      note: null,
    }));
    this.service.settingRelease(newReleases).subscribe({
      next: (res) => {
        if (res.success) {   // theo ApiResponse bạn code backend
          alert('Phát hành thành công!');
          this.dialogRef.close(newReleases);
        } else {
          alert('Phát hành thất bại: ' + res.message);
        }
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          'Đã xảy ra lỗi không xác định';
        alert('Lỗi phát hành: ' + errorMsg);
      }
    });
  }

  showList(targetType: string) {


  }



  closePopup() {
    this.dialogRef.close();
  }


}
