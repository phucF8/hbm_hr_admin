import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TopicDetailComponent } from '@app/voting/topic-detail/topic-detail.component';
import { TopicDetail } from '@app/voting/voting-list/responses/topic-detail.model';
import { VotingListService } from '@app/voting/voting-list/voting-list.service';

import { MatTabGroup } from '@angular/material/tabs';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { ChiNhanh, ChiNhanhService } from '@app/services/chi-nhanh.service';
import { TreeViewChecklistComponent } from "@app/uicomponents/tree-view-checklist/tree-view-checklist.component";
import { SearchUserFormComponent } from '@app/uicomponents/search-user-form/search-user-form.component';
import Swal from 'sweetalert2';
import { safeStringify } from '@app/utils/json-utils';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { showApiBusinessError, showApiError, showJsonDebug } from '@app/utils/error-handler';


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
  showDonvi = true;
  showNhanSu = true;

  nhanSuSelecteds: any[] = [];
  topicReleases: any[] = [];

  // Lấy instance của component con
  @ViewChild(TreeViewChecklistComponent)
  treeViewComp!: TreeViewChecklistComponent;

  @ViewChild('searchUserComp') searchUserComp!: SearchUserFormComponent;

  constructor(
    private toastr: ToastrService,
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

    this.loadingData(topic);

  }

  async loadingData(topic: TopicDetail) {
    await this.loadChiNhanhs();
    this.loadSettingRelease(topic.id);
  }

  // async loadChiNhanhs() {
  //   await this.chiNhanhService.getChiNhanhs().subscribe({
  //     next: (data) => {
  //       this.chiNhanhs = data;
  //       if (this.treeViewComp) {
  //         this.treeViewComp.buildTree(data);
  //       }
  //     },
  //     error: (err) => {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Lỗi tải dữ liệu',
  //         html: `<pre style="text-align:left;">ERR: ${JSON.stringify(err, null, 2)}</pre>`,
  //         confirmButtonText: 'Đóng'
  //       });
  //     }
  //   });
  // }

  loadChiNhanhs(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.chiNhanhService.getChiNhanhs().subscribe({
        next: (data) => {
          this.chiNhanhs = data;
          if (this.treeViewComp) {
            this.treeViewComp.buildTree(data);
          }
          resolve(); // ✅ báo đã xong
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi tải dữ liệu',
            html: `<pre style="text-align:left;">ERR: ${JSON.stringify(err, null, 2)}</pre>`,
            confirmButtonText: 'Đóng'
          });
          reject(err); // báo lỗi
        }
      });
    });
  }

  loadSettingRelease(topicId: string) {
    this.service.getSettingRelease(topicId).subscribe({
      next: (data) => {
        this.topicReleases = data;
        const selectedUsers = data
          .filter(u => u.targetType === "NHANSU")   // chỉ lấy targetType = NHANSU
          .map(u => ({
            ID: u.targetId,
            MaNhanVien: u.maNhanVien,
            Anh: u.anh?.startsWith('http')
              ? u.anh
              : `https://workhub.hbm.vn${u.anh}`,
            TenNhanVien: u.tenNhanVien,
            TenPhongBan: u.tenPhongBan,
            TenChucDanh: u.tenChucDanh,
            status: 0
          }));
        this.searchUserComp.setSelectedUsers(selectedUsers);
        const selectedChiNhanh = data
          .filter(u => u.targetType === "DONVI")   // chỉ lấy targetType = DONVI
          .map(u => ({
            ID: u.targetId,
          }));
        this.treeViewComp.setSelectedNode(selectedChiNhanh);
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Lỗi tải dữ liệu',
        //   html: `<pre style="text-align:left;">ERR: ${JSON.stringify(data, null, 2)}</pre>`,
        //   confirmButtonText: 'Đóng'
        // });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          html: `<pre style="text-align:left;">ERR: ${JSON.stringify(err, null, 2)}</pre>`,
          confirmButtonText: 'Đóng'
        });
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

  nhanSuSelected(users: any[]) {
    this.nhanSuSelecteds = users;
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
    const idUser = localStorage.getItem('id');
    if (!idUser) {
      alert('Không tìm thấy userID trong localStorage!');
      return;
    }
    //const nhanSuSelecteds = this.nhanSuSelecteds || [];
    const nhanSuSelecteds = this.searchUserComp.getSelected();
    const donviSelecteds = this.treeViewComp.getSelected() || [];
    const body: any[] = [
      ...donviSelecteds.map((item: any) => ({
        topicId: this.topic.id,
        targetType: 'DONVI',
        targetId: item.tag.id,
        releasedBy: idUser,
        note: null,
      })),
      ...nhanSuSelecteds.map((item: any) => ({
        topicId: this.topic.id,
        targetType: 'NHANSU',
        targetId: item.ID,
        releasedBy: idUser,
        note: null,
      })),
    ];
    // showJsonDebug(body);
    this.service.settingRelease(this.topic.id,body).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.toastr.success('', res.message || 'Lưu thiết lập thành công');
          this.dialogRef.close(body);
        } else {
          showApiBusinessError(res.message,'Lưu tiết lập thất bại');
        }
      },
      error: (err: HttpErrorResponse) => {
        showApiError(err, 'Lưu thiết lập thất bại');
      }
    });
  }

  showList(targetType: string) {


  }

  closePopup() {
    this.dialogRef.close();
  }


}


