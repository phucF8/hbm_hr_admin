--DANH SÁCH THÔNG BÁO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_GetNotificationsWithPaging')
    DROP PROCEDURE NS_ADTB_GetNotificationsWithPaging
GO

CREATE PROCEDURE NS_ADTB_GetNotificationsWithPaging
    @PageNumber INT,
    @PageSize INT,
    @NotificationType INT,  -- 0: Lấy tất cả, >0: Lọc theo loại thông báo
    @SentStatus INT = NULL  -- NULL: Lấy cả hai, 1: Đã gửi, 0: Chưa gửi
AS
BEGIN
    SET NOCOUNT ON;

    -- Đảm bảo @PageNumber không bị lỗi OFFSET -1
    IF @PageNumber < 1 SET @PageNumber = 1;

    -- Truy vấn dữ liệu và tính tổng số trang
    WITH CTE AS (
        SELECT 
            [ID],
            [Title],
            [Content],
            [SenderId],
            [TenNhanVien],        
            [NotificationType],
			[Status],
            [SentAt],
            [ReceivedCount],
            [TotalRecipients],
            [NgayTao],
            COUNT(*) OVER () AS TotalCount  -- Đếm tổng số bản ghi
        FROM [HBM_HCNSApp].[dbo].[v_NotificationsWithRecipients]
        WHERE 
            (@NotificationType = 0 OR NotificationType = @NotificationType)  
            AND (@SentStatus IS NULL OR 
                 (@SentStatus = 1 AND SentAt IS NOT NULL) OR 
                 (@SentStatus = 0 AND SentAt IS NULL))
    )
    SELECT 
        ID,
        Title,
        Content,
        SenderId,
        TenNhanVien,
        NotificationType,
		Status,
        SentAt,
        ReceivedCount,
        TotalRecipients,
        NgayTao,
        TotalCount,
        CEILING(CAST(TotalCount AS FLOAT) / @PageSize) AS TotalPages  -- Tính tổng số trang
    FROM CTE
    ORDER BY NgayTao DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

EXEC NS_ADTB_GetNotificationsWithPaging 
	@PageNumber = 1, 
	@PageSize = 10, 
	@NotificationType = 0;



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
    @SenderId  VARCHAR(36),
    @NotificationType TINYINT,
    @SentAt DATETIME = NULL,
    @NguoiTao VARCHAR(36),
    @NguoiSua VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[NS_ADTB_Notifications] (
        ID, Title, Content, SenderId, NotificationType, SentAt, NgayTao, NgaySua, NguoiTao, NguoiSua
    )
    VALUES (
        @ID, @Title, @Content, @SenderId, @NotificationType, @SentAt, GETDATE(), GETDATE(), @NguoiTao, @NguoiSua
    );
END
GO


EXEC InsertNotification
    @ID = 'TEST123',
    @Title = N'Thông báo kiểm tra',
    @Content = N'Nội dung thông báo kiểm tra',
    @SenderId = 'TEST123',
    @TriggerAction = 'TestAction',
    @NotificationType = 1,
    @SentAt = null,
    @NguoiTao = 'admin',
    @NguoiSua = 'admin';


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
    n.SenderId,
    n.SentAt,
    n.NotificationType,
	n.Status,
    n.NgayTao,
    nv.TenNhanVien,
    COUNT(r.ID) AS TotalRecipients,
    SUM(CASE WHEN r.Status > 0 THEN 1 ELSE 0 END) AS ReceivedCount
FROM NS_ADTB_Notifications n
LEFT JOIN NS_NhanViens nv ON n.SenderId = nv.ID
LEFT JOIN NS_ADTB_NotificationRecipients r ON n.ID = r.NotificationId
GROUP BY
    n.ID,
    n.Title,
    n.Content,
    n.SenderId,
    n.SentAt,
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