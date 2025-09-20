import { bootstrapApplication } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from '@app/guards/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()), // ✅ cho phép lấy interceptor từ DI
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, // ✅ đăng ký interceptor class
    provideRouter(routes), // nếu không dùng router thì bỏ dòng này
    provideAnimations(),   // bắt buộc cho toastr
    provideToastr({        // cấu hình toastr ở đây
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
})
.catch(err => console.error(err));
