import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '@app/constants/constants';
import { environment } from 'environments/environment';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  users: any[] = [];
  permissions: any[] = [];
  selectedUsername: string = '';

  private host = `${environment.apiUrl}`;  // Lấy apiUrl từ environment
  BASE_URL = BASE_URL;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient
  
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadPermissions();
  }

  loadUsers() {
        this.http.get<any[]>(`${this.host}/users/all`).subscribe(res => this.users = res);
  }

  loadPermissions() {
    this.http.get<any[]>(`${this.host}/permissions`).subscribe(res => {
      this.permissions = res.map(p => ({ ...p, selected: false }));
    });
  }

  onUserChange() {
    this.http.get<string[]>(`/api/user-permissions?username=${this.selectedUsername}`).subscribe(userPerms => {
      this.permissions.forEach(p => p.selected = userPerms.includes(p.code));
    });
  }

  savePermissions() {
    const selectedPerms = this.permissions
      .filter(p => p.selected)
      .map(p => p.code);

    const body = {
      username: this.selectedUsername,
      permissions: selectedPerms
    };

    this.http.post('/api/user-permissions', body).subscribe(() => {
      alert('Lưu quyền thành công!');
    });
  }

  viewUser(arg0: any) {
    // this.service.getDetail(id).subscribe({
    //       next: (topic) => {
    //         console.log('Loaded report detail:', topic);

            this.dialog.open(UserDetailComponent, {
              data: null,
              disableClose: false,
              panelClass: 'my-dialog', // Thêm class để tùy chỉnh CSS
              width: '80vw',
              height: '80vh',
              maxWidth: '100vw'
            })
              .afterClosed().subscribe(result => {
                if (result) {
                  //this.loadList();
                }
              });
          // }
          // error: (error) => {
          //   alert('Đã xảy ra lỗi khi tải chi tiết báo cáo');
          // }

        // });
  }

}
