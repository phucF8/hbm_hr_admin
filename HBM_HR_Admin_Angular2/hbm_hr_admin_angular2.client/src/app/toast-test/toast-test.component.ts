import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-toast-test',
  templateUrl: './toast-test.component.html',
  standalone: false,
})
export class ToastTestComponent {
  constructor(private toastr: ToastrService) {}

  showToast() {
    this.toastr.success('Thành công!', 'Thông báo');
  }
}
