import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '@app/constants/constants';
import { environment } from 'environments/environment';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '@app/services/users.service';
import Swal from 'sweetalert2';
import { showJsonDebug } from '@app/utils/error-handler';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']

})
export class AdminComponent implements OnInit {
  users: any[] = [];
  permissions: any[] = [];
  selectedUsername: string = '';

  private host = `${environment.apiUrl}`;  // Lấy apiUrl từ environment
  BASE_URL = BASE_URL;

  strErr: any;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.loadUsers();
    //this.loadPermissions();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (data) => {
        // showJsonDebug(data);
        this.users = data;
      },
      error: (err) => {
        this.strErr = err;
      }
    });
  }

  loadPermissions() {
    this.http.get<any[]>(`${this.host}/permissions`).subscribe(res => {
      this.permissions = res.map(p => ({ ...p, selected: false }));
    });
  }

  viewUser(user: any) {

    this.dialog.open(UserDetailComponent, {
      data: {
        user: user
      },
      disableClose: false,
      panelClass: 'my-dialog', // Thêm class để tùy chỉnh CSS
      width: '80vw',
      height: '80vh',
      maxWidth: '100vw'
    })
      .afterClosed().subscribe(result => {
        if (result) {
          this.loadUsers();
        }
      });

  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'images/avatar_default.png';
  }

  toggleAll($event: Event) {
    // const checked = (event.target as HTMLInputElement).checked;
    // this.items.forEach(item => (item.checked = checked));
  }

}
