-- DANH SÁCH THÔNG BÁO (CÓ TÌM KIẾM & SẮP XẾP)
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_GetNotificationsWithPaging')
    DROP PROCEDURE NS_ADTB_GetNotificationsWithPaging
GO

CREATE PROCEDURE NS_ADTB_GetNotificationsWithPaging
    @PageNumber INT,
    @PageSize INT,
    @NotificationType INT,         -- 0: Lấy tất cả, 1 tự động, 2 chủ động
    @SortBy NVARCHAR(50) = 'NgayTao',  -- Tên cột để sắp xếp
    @SearchText NVARCHAR(255) = '',    -- Tìm kiếm tiêu đề hoặc nội dung
    @SentStatus INT = NULL,        -- NULL: Lấy cả hai, 1: Đã gửi, 0: Chưa gửi
    @FromDate DATE = NULL,         -- Ngày tạo: từ ngày (bao gồm)
    @ToDate DATE = NULL,           -- Ngày tạo: đến ngày (bao gồm)
    @FromSentDate DATE = NULL,     -- Ngày gửi: từ ngày (bao gồm)
    @ToSentDate DATE = NULL,        -- Ngày gửi: đến ngày (bao gồm)
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber < 1 SET @PageNumber = 1;

    -- Sắp xếp an toàn: chỉ cho phép sort theo những cột cụ thể
    DECLARE @SortColumn NVARCHAR(50) = 
        CASE LOWER(@SortBy)
            WHEN 'ngaytao' THEN 'NgayTao'
            WHEN 'title' THEN 'Title'
            ELSE 'NgayTao' -- mặc định
        END;

    WITH CTE AS (
        SELECT 
            [ID],
            [Title],
            [Content],
            [TenNhanVien],        
            [NotificationType],
            [Status],
            [ReceivedCount],
            [TotalRecipients],
            [NgayTao],
            COUNT(*) OVER () AS TotalCount
        FROM [HBM_HCNSApp].[dbo].[v_NotificationsWithRecipients]
        WHERE 
            (@NotificationType = 0 OR NotificationType = @NotificationType)
            AND (@SentStatus IS NULL OR Status = @SentStatus)
            AND (@FromDate IS NULL OR NgayTao >= @FromDate)
            AND (@ToDate IS NULL OR NgayTao <= @ToDate)
            AND (
                @SearchText = '' OR 
                Title LIKE '%' + @SearchText + '%' OR 
                Content LIKE '%' + @SearchText + '%'
            )
    )
    SELECT 
        ID,
        Title,
        Content,
        TenNhanVien,
        NotificationType,
        Status,
        ReceivedCount,
        TotalRecipients,
        NgayTao,
        TotalCount,
        CEILING(CAST(TotalCount AS FLOAT) / @PageSize) AS TotalPages
    FROM CTE
    ORDER BY 
        CASE WHEN @SortColumn = 'NgayTao' THEN NgayTao END DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO



EXEC NS_ADTB_GetNotificationsWithPaging
    @PageNumber = 1,
    @PageSize = 10,
    @NotificationType = 0,
    @SortBy = N'ngayTao',        -- hoặc 'sentAt', 'title'
    @SearchText = N'công văn',   -- từ khóa tìm kiếm, để '' nếu không cần
    @SentStatus = NULL,          -- NULL: tất cả, 1: đã gửi, 0: chưa gửi
    @FromDate = '2024-01-01',
    @ToDate = '2025-04-30',
    @FromSentDate = NULL,
    @ToSentDate = NULL;






-- =============================================
-- Stored Procedure: NS_ADTB_GetNotificationById
-- Description: Lấy thông tin chi tiết của một thông báo theo ID
-- Author: HBM HR Admin
-- Created: 2024-03-19
-- =============================================
-- Lấy về thông tin của 1 record thông báo có id = ?
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_GetNotificationById')
    DROP PROCEDURE NS_ADTB_GetNotificationById
GO

CREATE PROCEDURE NS_ADTB_GetNotificationById
    @NotificationID VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        tb.ID,
        tb.Title,
        tb.Content,
        tb.SenderID,
        nv.TenNhanVien,
        tb.NotificationType,
        tb.Status,
        tb.SentAt,
        tb.NgayTao,
        tb.NgaySua,
        tb.NguoiTao,
        tb.NguoiSua
    FROM NS_ADTB_Notifications tb
    LEFT JOIN NS_NhanViens nv ON tb.SenderID = nv.ID
    WHERE tb.ID = @NotificationID;
END
GO

/*EXEC NS_ADTB_GetNotificationById 
    @NotificationID = '612dd7be-46cb-408e-8f14-471e2445d77a';*/




-- SỬA THÔNG BÁO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_UpdateNotification')
    DROP PROCEDURE NS_ADTB_UpdateNotification
GO
CREATE PROCEDURE NS_ADTB_UpdateNotification
    @ID VARCHAR(50),
    @Title NVARCHAR(500),
    @Content NVARCHAR(MAX),
    @NguoiSua NVARCHAR(50),
    @NotificationType INT,
	@SentAt DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NS_ADTB_Notifications
    SET 
        Title = @Title,
        Content = @Content,
        NgaySua = GETDATE(),
        NguoiSua = @NguoiSua,
        NotificationType = @NotificationType,
		SentAt = @SentAt
    WHERE ID = @ID;
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Không tìm thấy thông báo với ID: %s', 16, 1, @ID);
    END
END
GO
/*
EXEC NS_ADTB_UpdateNotification 
    @ID = '8810c641-7195-4f90-b420-3a9c03cf8ba0',
    @Title = N'Tiêu đề mới cập nhật',
    @Content = N'Nội dung thông báo đã được cập nhật.',
    @NguoiSua = N'admin';*/



--XÓA THÔNG BÁO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_DeleteNotification')
    DROP PROCEDURE NS_ADTB_DeleteNotification
GO

CREATE PROCEDURE NS_ADTB_DeleteNotification
    @NotificationID  VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM NS_ADTB_Notifications
    WHERE ID = @NotificationID;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Không tìm thấy thông báo với ID: %s', 16, 1, @NotificationID);
    END
END
GO

--XÓA NHIỀU THÔNG BÁO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_DeleteMultiNotification')
    DROP PROCEDURE NS_ADTB_DeleteMultiNotification
GO
CREATE PROCEDURE NS_ADTB_DeleteMultiNotification
    @NotificationIDs NVARCHAR(MAX) -- Danh sách ID, cách nhau bằng dấu phẩy
AS
BEGIN
    SET NOCOUNT ON;
    -- Tạo bảng tạm để lưu danh sách ID
    DECLARE @TempIDs TABLE (ID NVARCHAR(36));
    -- Chèn dữ liệu vào bảng tạm bằng cách tách chuỗi bằng hàm fn_StringSplit
    INSERT INTO @TempIDs (ID)
	SELECT LTRIM(RTRIM(Value)) FROM dbo.fn_StringSplit(@NotificationIDs, ',');
    -- Xóa các thông báo có ID nằm trong danh sách
    DELETE FROM NS_ADTB_Notifications
    WHERE ID IN (SELECT ID FROM @TempIDs);
    -- Kiểm tra xem có thông báo nào bị xóa không
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Không tìm thấy thông báo với các ID đã cung cấp.', 16, 1);
    END
END
GO

8810c641-7195-4f90-b420-3a9c03cf8ba0, d0c8cc9e-9a22-4d0f-ac6c-fcc0b9560b07


--TẠO THÔNG BÁO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'InsertNotification')
    DROP PROCEDURE InsertNotification;
GO
CREATE PROCEDURE InsertNotification
    @ID VARCHAR(36),
    @Title NVARCHAR(255),
    @Content NVARCHAR(2000),
    @NotificationType TINYINT,
    @NguoiTao VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[NS_ADTB_Notifications] (
        ID, Title, Content, NguoiTao, NotificationType, NgayTao
    )
    VALUES (
        @ID, @Title, @Content, @NguoiTao, @NotificationType, GETDATE()
    );
END
GO

-- TEST PROCEDURE InsertNotification
DECLARE @ID UNIQUEIDENTIFIER = NEWID();
DECLARE @Title NVARCHAR(255) = N'Thông báo kiểm tra';
DECLARE @Content NVARCHAR(2000) = N'Nội dung của thông báo kiểm tra';
DECLARE @NotificationType TINYINT = 1;  -- Ví dụ: 1 = Chung, 2 = Cá nhân, v.v.
DECLARE @NguoiTao VARCHAR(36) = 'user-123';

EXEC InsertNotification
    @ID = @ID,
    @Title = @Title,
    @Content = @Content,
    @NotificationType = @NotificationType,
    @NguoiTao = @NguoiTao;


--khi tạo thông báo theo nhóm, thì tạo bản ghi liên kết giữa thông báo và user
CREATE PROCEDURE InsertNotificationRecipient
    @NotificationId NVARCHAR(36),
    @RecipientId NVARCHAR(36),
    @NguoiTao VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[NS_ADTB_NotificationRecipients] (
        ID,
        NotificationId,
        RecipientId,
        Status,
        NgayTao,
        NgaySua,
        NguoiTao,
        NguoiSua
    )
    VALUES (
        NEWID(), -- Tạo ID ngẫu nhiên
        @NotificationId,
        @RecipientId,
        0, -- Trạng thái mặc định là 0 (chưa gửi)
        GETDATE(),
        GETDATE(),
        @NguoiTao,
        @NguoiTao -- Người sửa ban đầu sẽ là người tạo
    );
END;

EXEC InsertNotificationRecipient 
    @NotificationId = 'some-notification-id',
    @RecipientId = 'some-user-id',
    @NguoiTao = 'creator-id';









--lấy về ds nhóm user đối với thông báo cho nhóm
CREATE PROCEDURE SelectNotificationRecipients
    @NotificationId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        nr.NotificationId,
        nr.RecipientId,
        nv.TenNhanVien,
        nr.Status
    FROM [HBM_HCNSApp].[dbo].[NS_ADTB_NotificationRecipients] nr
    INNER JOIN [HBM_HCNSApp].[dbo].[NS_NhanViens] nv
        ON nr.RecipientId = nv.ID
    WHERE nr.NotificationId = @NotificationId;
END;


--EXEC SelectNotificationRecipients @NotificationId = 'GUID_CUA_NOTIFICATION'

--xóa ds nhóm user đối với thông báo cho nhóm để insert lại sau đó (cho tính năng update)
CREATE PROCEDURE DeleteNotificationRecipients
    @NotificationId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [HBM_HCNSApp].[dbo].[NS_ADTB_NotificationRecipients]
    WHERE NotificationId = @NotificationId;
END;


--EXEC DeleteNotificationRecipients @NotificationId = 'your-notification-id';
CREATE TYPE NotificationIdTableType AS TABLE
(
    NotificationId VARCHAR(36)
);
CREATE PROCEDURE DeleteNotificationRecipients_Multiple
    @NotificationIds NotificationIdTableType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM [HBM_HCNSApp].[dbo].[NS_ADTB_NotificationRecipients]
    WHERE NotificationId IN (SELECT NotificationId FROM @NotificationIds);
END;























































IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_NotificationsWithRecipients')
    DROP VIEW v_NotificationsWithRecipients;
GO

CREATE VIEW v_NotificationsWithRecipients AS
SELECT
    n.ID,
    n.Title,
    n.Content,
    n.NotificationType,
	n.Status,
    n.NgayTao,
    nv.TenNhanVien,
    COUNT(r.ID) AS TotalRecipients,
    SUM(CASE WHEN r.Status > 0 THEN 1 ELSE 0 END) AS ReceivedCount
FROM NS_ADTB_Notifications n
LEFT JOIN NS_NhanViens nv ON n.NguoiTao = nv.ID
LEFT JOIN NS_ADTB_NotificationRecipients r ON n.ID = r.IDThongBao
GROUP BY
    n.ID,
    n.Title,
    n.Content,
    n.NotificationType,
	n.Status,
    n.NgayTao,
    nv.TenNhanVien;













-- lấy DeviceToken từ IDNhanVien
CREATE PROCEDURE GetDeviceTokenByEmployeeId
    @IDNhanVien VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        DeviceToken, 
        DeviceName
    FROM dbo.NS_NhanVien_DeviceTokens
    WHERE IDNhanVien = @IDNhanVien;
END;
GO

EXEC GetDeviceTokenByEmployeeId @IDNhanVien = '123e4567-e89b-12d3-a456-426614174000';





-- update trạng thái sau khi gửi thông báo
CREATE PROCEDURE [dbo].[UpdateNotificationStatus]
    @NotificationId NVARCHAR(36)
AS
BEGIN
    -- Cập nhật bảng NS_ADTB_Notifications, thay đổi Status = 1 (Đã gửi)
    UPDATE [dbo].[NS_ADTB_Notifications]
    SET [Status] = 1, 
        [SentAt] = GETDATE(),  -- Cập nhật thời gian gửi
        [NgaySua] = GETDATE(),  -- Cập nhật thời gian chỉnh sửa
        [NguoiSua] = 'SYSTEM'   -- Thay thế nếu cần
    WHERE [ID] = @NotificationId;

    -- Cập nhật bảng NS_ADTB_NotificationRecipients, thay đổi Status = 1 (Đã nhận)
    UPDATE [dbo].[NS_ADTB_NotificationRecipients]
    SET [Status] = 1, 
        [NgaySua] = GETDATE(),  -- Cập nhật thời gian chỉnh sửa
        [NguoiSua] = 'SYSTEM'   -- Thay thế nếu cần
    WHERE [NotificationId] = @NotificationId;
    
END
GO

EXEC UpdateNotificationStatus @NotificationId = '60914bbc-928b-4ec0-b346-af5732be1998';