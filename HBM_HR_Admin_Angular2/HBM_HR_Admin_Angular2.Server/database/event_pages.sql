-- Table: EventPages - Quản lý các Event/Landing Page có thời hạn
-- Author: System
-- Created: 2026-03-05

CREATE TABLE EventPages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    HtmlContent NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    Version INT NOT NULL DEFAULT 1,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NULL,
    Priority INT NOT NULL DEFAULT 0
);

-- Thêm mô tả cho table
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Quản lý các Event Page/Landing Page với khả năng hiển thị theo thời gian và độ ưu tiên', 
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages';

-- Thêm mô tả cho các column
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'GUID của Event Page',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'Id';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tiêu đề Event',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'Title';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Nội dung HTML của Event Page',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'HtmlContent';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Trạng thái bật/tắt thủ công (0=Tắt, 1=Bật)',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'IsActive';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Phiên bản của Event (dùng cho versioning)',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'Version';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Thời gian bắt đầu hiển thị Event',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'StartTime';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Thời gian kết thúc (NULL = vô thời hạn)',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'EndTime';

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Độ ưu tiên hiển thị (số càng cao càng ưu tiên)',
    @level0type = N'SCHEMA', @level0name = dbo, 
    @level1type = N'TABLE', @level1name = N'EventPages',
    @level2type = N'COLUMN', @level2name = N'Priority';

-- Tạo index để tăng performance khi query
CREATE INDEX IX_EventPages_IsActive_StartTime_EndTime 
    ON EventPages (IsActive, StartTime, EndTime);

CREATE INDEX IX_EventPages_Priority 
    ON EventPages (Priority DESC);

-- Insert dữ liệu mẫu (optional - có thể comment nếu không cần)
INSERT INTO EventPages (Id, Title, HtmlContent, IsActive, Version, StartTime, EndTime, Priority)
VALUES 
    (NEWID(), N'Tết Nguyên Đán 2026', N'<h1>Chúc mừng năm mới!</h1>', 1, 1, '2026-01-25', '2026-02-05', 10),
    (NEWID(), N'Khuyến mãi Tháng 3', N'<h1>Giảm giá 20%</h1>', 1, 1, '2026-03-01', '2026-03-31', 5),
    (NEWID(), N'Event Ưu tiên cao - Test', N'<h1>Event có priority cao nhất</h1>', 1, 1, '2026-03-01', '2026-03-15', 20);

GO
