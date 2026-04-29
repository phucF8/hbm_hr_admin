Trong code Backend .NET C#
Trong Resources/Templates/event-preview-template.html
Đoạn code
<img src="logo_hbm_white.png" class="top-logo" alt="Logo">
đang không load hiện được ảnh

background-image: {{IMAGE_URL}};
thì load và hiện được ảnh

làm sao để <img src="logo_hbm_white.png" class="top-logo" alt="Logo"> hiển thị ảnh

Đã đặt file đúng thư mục
wwwroot/logo_hbm_white.png
như vậy đã đúng chưa?
và ảnh sẽ hiển thị khi user browser event-preview-template.html ?




File event-detail.component.html, dùng iframe render code html trả về từ api [HttpPost("active")] trong EventController.cs
Hãy đọc code trên và trả lời tôi làm sao để iframe render code html hiển thị được ảnh logo_hbm_white.png
logo_hbm_white.png đang đặt trong thư mục wwwroot/

Trong Resources/Templates/event-preview-template.html, tôi đang dùng đường dẫn tương đối 
hãy đọc nội dung file và trả lời tôi làm sao để hiển thị ảnh logo_hbm_white.png

Trong Resources/Templates/event-preview-template.html, tôi đang dùng đường dẫn tuyệt đối 
<img src="/logo_hbm_white.png" class="top-logo" alt="Logo">
ảnh vẫn không được hiển thị

cấu hình app.UseStaticFiles() là sao nhỉ ?
cấu hình app.UseStaticFiles()  thực hiện như thế nào?


Trong Program.cs
var app = builder.Build();
app.UseStaticFiles(); // Cho phép truy cập file tĩnh từ wwwroot

Hãy kiểm tra 
Program.cs, 
thư mục wwwroot, 
file esources/Templates/event-preview-template.html
EventController.cs
và trả lời tại sao ảnh logo_hbm_white.png vẫn chưa hiển thị 

Truy cập trực tiếp http://localhost:8088/logo_hbm_white.png thấy 



Hãy đọc file angular.json và cho tôi biết cách để build code Frontend bằng Angular này

API Luôn trả về event trong ngày khoảng ngày đã định, ko check active  true/false
Nếu active = false thiết bị mobile sẽ không show banner event
