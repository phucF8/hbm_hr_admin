





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
        nv.TenNhanVien,
        tb.NotificationType,
        tb.LoaiThongBao,
        tb.Status,
        tb.NgayTao,
        tb.NgaySua,
        tb.NguoiTao,
        tb.NguoiSua,
        tb.IDThamChieu
    FROM NS_ADTB_Notifications tb
    LEFT JOIN NS_NhanViens nv ON tb.NguoiTao = nv.ID
    WHERE tb.ID = @NotificationID;
END
GO

EXEC NS_ADTB_GetNotificationById 
    @NotificationID = '9d4be878907c4de1';




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


IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'InsertNotificationRecipient')
    DROP PROCEDURE InsertNotificationRecipient;
GO
--khi tạo thông báo theo nhóm, thì tạo bản ghi liên kết giữa thông báo và user
CREATE PROCEDURE InsertNotificationRecipient
    @NotificationId NVARCHAR(36),
    @NguoiNhan NVARCHAR(36),
    @NguoiTao VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[NS_ADTB_NotificationRecipients] (
        ID,
        IDThongBao,
        NguoiNhan,
        Status,
        NgayTao,
        NgaySua,
        NguoiTao,
        NguoiSua
    )
    VALUES (
        NEWID(), -- Tạo ID ngẫu nhiên
        @NotificationId,
        @NguoiNhan,
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
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SelectNotificationRecipients')
    DROP PROCEDURE SelectNotificationRecipients;
GO
CREATE PROCEDURE SelectNotificationRecipients
    @NotificationId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        nr.IDThongBao,
        nr.NguoiNhan,
        nv.TenNhanVien,
        nv.TenChucDanh,
        nv.TenPhongBan,
        nv.TenKho,
        nr.Status,
        nr.NgayTao,
        nr.NgaySua
    FROM [HBM_HCNSApp].[dbo].[NS_ADTB_NotificationRecipients] nr
    INNER JOIN [HBM_HCNSApp].[dbo].[NS_NhanViens] nv
        ON nr.NguoiNhan = nv.ID
    WHERE nr.IDThongBao = @NotificationId;
END;

EXEC SelectNotificationRecipients @NotificationId = 'GUID_CUA_NOTIFICATION'

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



IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'DeleteNotificationRecipients_Multiple')
    DROP PROCEDURE DeleteNotificationRecipients_Multiple;
GO
CREATE PROCEDURE DeleteNotificationRecipients_Multiple
    @NotificationIds NotificationIdTableType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [HBM_HCNSApp].[dbo].[NS_ADTB_NotificationRecipients]
    WHERE IDThongBao IN (SELECT NotificationId FROM @NotificationIds);
END;




IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'UpdateNotificationStatus')
    DROP PROCEDURE UpdateNotificationStatus;
GO
-- update trạng thái sau khi gửi thông báo
CREATE PROCEDURE [dbo].[UpdateNotificationStatus]
    @NotificationId NVARCHAR(36)
AS
BEGIN
    -- Cập nhật bảng NS_ADTB_Notifications, thay đổi Status = 1 (Đã gửi)
    UPDATE [dbo].[NS_ADTB_Notifications]
    SET [Status] = 1
    WHERE [ID] = @NotificationId;
    
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'UpdateStatusSentDetail')
    DROP PROCEDURE UpdateStatusSentDetail;
GO
CREATE PROCEDURE [dbo].[UpdateStatusSentDetail]
    @NotificationId VARCHAR(36),
	@NguoiNhan VARCHAR(36)
AS
BEGIN
    UPDATE [dbo].[NS_ADTB_NotificationRecipients]
    SET [Status] = 1
    WHERE [IDThongBao] = @NotificationId AND [NguoiNhan] = @NguoiNhan;
END
GO

EXEC UpdateNotificationStatus @NotificationId = '60914bbc-928b-4ec0-b346-af5732be1998';























































































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




