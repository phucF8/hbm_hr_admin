# GopYController - Flowchart Luồng Xử Lý

```mermaid
flowchart TD
    Start([Request tới GopYController]) --> CheckEndpoint{Endpoint nào?}
    
    CheckEndpoint -->|POST /create| Create["<b>Create Góp Ý</b>"]
    CheckEndpoint -->|POST /GetGopYs| GetGopYs["<b>Get Danh Sách Góp Ý</b>"]
    CheckEndpoint -->|POST /GetChiTiet| GetChiTiet["<b>Get Chi Tiết Góp Ý</b>"]
    CheckEndpoint -->|POST /Delete| Delete["<b>Delete Góp Ý</b>"]
    CheckEndpoint -->|POST /phanhoi/create| CreatePhanHoi["<b>Create Phản Hồi</b>"]
    CheckEndpoint -->|POST /set-group| SetGroup["<b>Set Group</b>"]
    
    %% --- CREATE ENDPOINT ---
    Create --> Create1["Validate:<br/>- ID = NewGuid hoặc từ request<br/>- NguoiNhanID phải có<br/>- NhanVienID phải có"]
    Create1 --> Create2{Người gửi = Người nhận?}
    Create2 -->|Yes| CreateErr1["❌ Lỗi: Trùng nhau"]
    Create2 -->|No| Create3{AnDanh = true?}
    Create3 -->|Yes| Create4["Kiểm tra giới hạn<br/>góp ý ẩn danh<br/>trong ngày ≤ 3"]
    Create4 --> Create4a{Vượt quá 3?}
    Create4a -->|Yes| CreateErr2["❌ Lỗi: Quá 3 góp ý ẩn danh"]
    Create4a -->|No| Create5["Tạo MaTraCuu<br/>GY-yyyyMMdd-GUID"]
    Create3 -->|No| Create5
    Create5 --> Create6["Tạo object GopY<br/>TrangThai = GY_CD"]
    Create6 --> Create7{Có file đính kèm?}
    Create7 -->|Yes| Create8["🔄 MoveFileFromTmpToUploads<br/>- Copy: tmp → uploads<br/>- Lưu đường dẫn vào DB<br/>- Retry 5 lần nếu file lock"]
    Create7 -->|No| Create9["Thêm GopY vào DB<br/>SaveChanges"]
    Create8 --> Create9
    Create9 --> Create10["CreateThongBao<br/>CreateNotification<br/>SendFirebase"]
    Create10 --> CreateOk["✅ GopY tạo thành công"]
    CreateErr1 --> CreateFail["❌ Bad Request"]
    CreateErr2 --> CreateFail
    
    %% --- GET GOPY LIST ---
    GetGopYs --> GetGopYs1["Validate PageNumber/PageSize"]
    GetGopYs1 --> GetGopYs2["Lọc theo TypeRequest"]
    GetGopYs2 --> GetGopYs2a{TypeRequest}
    GetGopYs2a -->|BY_ME| GetGopYs2b["Where: NhanVienID = currentUserId"]
    GetGopYs2a -->|TO_ME| GetGopYs2c["Where: NguoiNhanID = currentUserId"]
    GetGopYs2b --> GetGopYs3["Lọc TrangThai<br/>nếu có"]
    GetGopYs2c --> GetGopYs3
    GetGopYs3 --> GetGopYs4["Lọc FilterType:<br/>CPL = chưa phân loại"]
    GetGopYs4 --> GetGopYs5["Tìm kiếm từ khóa<br/>NoiDung, TieuDe, MaTraCuu"]
    GetGopYs5 --> GetGopYs6["Đếm TotalItems"]
    GetGopYs6 --> GetGopYs7["JOIN DbNhanVien<br/>nhận + gửi"]
    GetGopYs7 --> GetGopYs8["JOIN GY_Group"]
    GetGopYs8 --> GetGopYs9["Order By NgayGui DESC"]
    GetGopYs9 --> GetGopYs10["Skip & Take<br/>Phân trang"]
    GetGopYs10 --> GetGopYsOk["✅ Trả về<br/>PagedResultGopY"]
    
    %% --- GET CHI TIET ---
    GetChiTiet --> GetChiTiet1{ID hợp lệ?}
    GetChiTiet1 -->|No| GetChiTietErr["❌ ID không hợp lệ"]
    GetChiTiet1 -->|Yes| GetChiTiet2["JOIN đầy đủ thông tin<br/>Người gửi + Người nhận"]
    GetChiTiet2 --> GetChiTiet3["Lấy danh sách Files<br/>đính kèm"]
    GetChiTiet3 --> GetChiTiet4["Lấy entity từ DB"]
    GetChiTiet4 --> GetChiTiet5{TrangThai = GY_CD<br/>& UserID ≠ NhanVienID?}
    GetChiTiet5 -->|Yes| GetChiTiet6["Cập nhật<br/>TrangThai → GY_DD<br/>Marked as Read"]
    GetChiTiet5 -->|No| GetChiTietOk
    GetChiTiet6 --> GetChiTietOk["✅ Trả về<br/>GopYChiTietDto"]
    GetChiTietErr --> GetChiTietFail["❌ Not Found"]
    
    %% --- DELETE ---
    Delete --> Delete1["Tìm GopY by ID"]
    Delete1 --> Delete2{GopY tồn tại?}
    Delete2 -->|No| DeleteErr1["❌ Góp ý không tồn tại"]
    Delete2 -->|Yes| Delete3{TrangThai ≠ GY_CD?}
    Delete3 -->|Yes| DeleteErr2["❌ Góp ý đã được xem<br/>Không thể xóa"]
    Delete3 -->|No| Delete4{UserID = NhanVienID?}
    Delete4 -->|No| DeleteErr3["❌ Không phải người tạo"]
    Delete4 -->|Yes| Delete5["Xóa files<br/>đính kèm"]
    Delete5 --> Delete6["Xóa phản hồi<br/>+ files phản hồi"]
    Delete6 --> Delete7["Xóa GopY<br/>SaveChanges"]
    Delete7 --> DeleteOk["✅ Xóa thành công"]
    DeleteErr1 --> DeleteFail["❌ Not Found / Bad Request"]
    DeleteErr2 --> DeleteFail
    DeleteErr3 --> DeleteFail
    
    %% --- CREATE PHAN HOI ---
    CreatePhanHoi --> CreatePH1{NoiDung rỗng?}
    CreatePH1 -->|Yes| CreatePHErr["❌ Nội dung trống"]
    CreatePH1 -->|No| CreatePH2["Begin Transaction"]
    CreatePH2 --> CreatePH3["Tạo PhanHoi ID<br/>NewGuid"]
    CreatePH3 --> CreatePH4["Tạo object PhanHoi<br/>NgayPhanHoi = Now"]
    CreatePH4 --> CreatePH5["Add vào context"]
    CreatePH5 --> CreatePH6["SaveChanges"]
    CreatePH6 --> CreatePH7{Có Files?}
    CreatePH7 -->|Yes| CreatePH8["🔄 MoveFileFromTmpToUploads<br/>Copy file + Retry"]
    CreatePH7 -->|No| CreatePH9
    CreatePH8 --> CreatePH9["SaveChanges lần 2"]
    CreatePH9 --> CreatePH10["Commit Transaction"]
    CreatePH10 --> CreatePHOk["✅ Phản hồi tạo thành công"]
    CreatePHErr --> CreatePHFail["❌ Bad Request"]
    
    %% --- SET GROUP ---
    SetGroup --> SetGroup1{GopYID & GroupID hợp lệ?}
    SetGroup1 -->|No| SetGroupErr1["❌ Tham số không hợp lệ"]
    SetGroup1 -->|Yes| SetGroup2["Begin Transaction"]
    SetGroup2 --> SetGroup3["Tìm GopY by ID"]
    SetGroup3 --> SetGroup4{GopY tồn tại?}
    SetGroup4 -->|No| SetGroupErr2["❌ GopY không tồn tại"]
    SetGroup4 -->|Yes| SetGroup5["Kiểm tra Group tồn tại"]
    SetGroup5 --> SetGroup6{Group tồn tại?}
    SetGroup6 -->|No| SetGroupErr3["❌ Group không tồn tại"]
    SetGroup6 -->|Yes| SetGroup7["Gán GopY.GroupID<br/>= request.GroupID"]
    SetGroup7 --> SetGroup8["Update & SaveChanges"]
    SetGroup8 --> SetGroup9["Commit Transaction"]
    SetGroup9 --> SetGroupOk["✅ Gán nhóm thành công"]
    SetGroupErr1 --> SetGroupFail["❌ Bad Request / Not Found"]
    SetGroupErr2 --> SetGroupFail
    SetGroupErr3 --> SetGroupFail
    
    %% Return Results
    CreateOk --> End["OK 200"]
    CreateFail --> End
    GetGopYsOk --> End
    GetChiTietOk --> End
    GetChiTietFail --> End
    DeleteOk --> End
    DeleteFail --> End
    CreatePHOk --> End
    CreatePHFail --> End
    SetGroupOk --> End
    SetGroupFail --> End
    
    style Start fill:#e1f5ff
    style End fill:#e1f5ff
    style Create fill:#fff9c4
    style GetGopYs fill:#fff9c4
    style GetChiTiet fill:#fff9c4
    style Delete fill:#ffccbc
    style CreatePhanHoi fill:#fff9c4
    style SetGroup fill:#c8e6c9
    style CreateOk fill:#c8e6c9
    style DeleteOk fill:#c8e6c9
    style CreatePHOk fill:#c8e6c9
    style SetGroupOk fill:#c8e6c9
    style GetGopYsOk fill:#c8e6c9
    style GetChiTietOk fill:#c8e6c9
    style CreateFail fill:#ffccbc
    style DeleteFail fill:#ffccbc
    style CreatePHFail fill:#ffccbc
    style SetGroupFail fill:#ffccbc
    style GetChiTietFail fill:#ffccbc
```

## Chú Thích Luồng Xử Lý

### 1. **Create Góp Ý** (`POST /api/gopy/create`)
- Kiểm tra validation người gửi, người nhận
- Kiểm tra giới hạn góp ý ẩn danh (≤3/ngày)
- Tạo mã tra cứu `GY-yyyyMMdd-GUID`
- Xử lý file: Copy từ `tmp` → `uploads` (retry nếu file lock)
- Lưu GopY vào DB with `TrangThai = GY_CD` (Chưa Đọc)
- Gửi thông báo Firebase

### 2. **Get Danh Sách Góp Ý** (`POST /api/gopy/GetGopYs`)
- Lọc theo: `BY_ME` (góp ý của tôi), `TO_ME` (góp ý gửi đến tôi)
- Lọc theo trạng thái, nhóm, tìm kiếm từ khóa
- JOIN nhân viên (gửi, nhận) + nhóm phân loại
- Sắp xếp by `NgayGui DESC`
- Phân trang `Skip/Take`

### 3. **Get Chi Tiết Góp Ý** (`POST /api/gopy/GetChiTiet`)
- Kiểm tra ID hợp lệ
- JOIN đầy đủ thông tin, lấy files đính kèm
- **Tự động cập nhật status**: `GY_CD` (Chưa Đọc) → `GY_DD` (Đã Đọc)
- Trả về full details + attachments

### 4. **Delete Góp Ý** (`POST /api/gopy/Delete`)
- Kiểm tra GopY tồn tại
- Kiểm tra `TrangThai == GY_CD` (chỉ xóa khi chưa được xem)
- Kiểm tra chỉ người tạo mới được xóa
- Xóa cascading: Files → PhanHoi + Files PhanHoi → GopY

### 5. **Create Phản Hồi** (`POST /api/gopy/phanhoi/create`)
- Validate nội dung không trống
- Begin Transaction
- Tạo PhanHoi + xử lý files (copy tmp → uploads)
- Commit / Rollback

### 6. **Set Group Phân Loại** (`POST /api/gopy/set-group`)
- Kiểm tra GopY + Group tồn tại
- Cập nhật `GopY.GroupID`
- Transaction bảo vệ tính toàn vẹn dữ liệu

## Tính Năng Chính
✅ File handling: Copy file from tmp → uploads (retry 5 lần nếu lock)
✅ Status tracking: Auto update GY_CD → GY_DD khi xem
✅ Anonymous feedback: Giới hạn 3 góp ý ẩn danh/ngày
✅ Transaction safety: Rollback nếu có lỗi
✅ Firebase notifications: Gửi thông báo cho người nhận
✅ Pagination + filtering + search
