-- =============================================
-- Stored Procedure: NS_ADTB_GetNotificationsWithPaging
-- Description: Lấy danh sách thông báo với phân trang và lọc
-- Author: HBM HR Admin
-- Created: 2024-03-19
-- =============================================

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

    SELECT 
        n.ID AS NotificationID,
        n.Title,
        n.Content,
        n.SenderId,
        nv.TenNhanVien,
        n.TriggerAction,
        n.NotificationType,
        n.Status,
        n.SentAt,
        n.NgayTao,
        n.NgaySua,
        n.NguoiTao,
        n.NguoiSua
    FROM [dbo].[NS_ADTB_Notifications] n
    LEFT JOIN [dbo].[NS_NhanViens] nv ON n.SenderId = nv.ID
    WHERE 
        (@NotificationType = 0 OR n.NotificationType = @NotificationType)
        AND (@SentStatus IS NULL OR 
             (@SentStatus = 1 AND n.SentAt IS NOT NULL) OR 
             (@SentStatus = 0 AND n.SentAt IS NULL))
    ORDER BY n.NgayTao DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- =============================================
-- Stored Procedure: NS_ADTB_GetNotificationById
-- Description: Lấy thông tin chi tiết của một thông báo theo ID
-- Author: HBM HR Admin
-- Created: 2024-03-19
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_GetNotificationById')
    DROP PROCEDURE NS_ADTB_GetNotificationById
GO

CREATE PROCEDURE NS_ADTB_GetNotificationById
    @NotificationID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        tb.NotificationID,
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
    FROM NS_ADTB_ThongBao tb
    LEFT JOIN NS_NhanVien nv ON tb.SenderID = nv.MaNhanVien
    WHERE tb.NotificationID = @NotificationID;
END
GO

-- =============================================
-- Stored Procedure: NS_ADTB_UpdateNotification
-- Description: Cập nhật thông tin của một thông báo
-- Author: HBM HR Admin
-- Created: 2024-03-19
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_UpdateNotification')
    DROP PROCEDURE NS_ADTB_UpdateNotification
GO

CREATE PROCEDURE NS_ADTB_UpdateNotification
    @NotificationID VARCHAR(50),
    @Title NVARCHAR(500),
    @Content NVARCHAR(MAX),
    @NguoiSua NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE NS_ADTB_ThongBao
    SET 
        Title = @Title,
        Content = @Content,
        NgaySua = GETDATE(),
        NguoiSua = @NguoiSua
    WHERE NotificationID = @NotificationID;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Không tìm thấy thông báo với ID: %s', 16, 1, @NotificationID);
    END
END
GO

-- =============================================
-- Stored Procedure: NS_ADTB_DeleteNotification
-- Description: Xóa một thông báo
-- Author: HBM HR Admin
-- Created: 2024-03-19
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_DeleteNotification')
    DROP PROCEDURE NS_ADTB_DeleteNotification
GO

CREATE PROCEDURE NS_ADTB_DeleteNotification
    @NotificationID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM NS_ADTB_ThongBao
    WHERE NotificationID = @NotificationID;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Không tìm thấy thông báo với ID: %s', 16, 1, @NotificationID);
    END
END
GO

-- =============================================
-- Stored Procedure: NS_ADTB_CreateNotification
-- Description: Tạo một thông báo mới
-- Author: HBM HR Admin
-- Created: 2024-03-19
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'NS_ADTB_CreateNotification')
    DROP PROCEDURE NS_ADTB_CreateNotification
GO

CREATE PROCEDURE NS_ADTB_CreateNotification
    @Title NVARCHAR(500),
    @Content NVARCHAR(MAX),
    @SenderID VARCHAR(50),
    @NotificationType INT,
    @NguoiTao NVARCHAR(50),
    @NotificationID VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Tạo ID mới
    SET @NotificationID = 'TB' + FORMAT(GETDATE(), 'yyyyMMddHHmmss') + RIGHT('000' + CAST(ABS(CHECKSUM(NEWID())) % 1000 AS VARCHAR(3)), 3);

    INSERT INTO NS_ADTB_ThongBao (
        NotificationID,
        Title,
        Content,
        SenderID,
        NotificationType,
        Status,
        NgayTao,
        NgaySua,
        NguoiTao,
        NguoiSua
    )
    VALUES (
        @NotificationID,
        @Title,
        @Content,
        @SenderID,
        @NotificationType,
        0, -- Status mặc định là 0 (Chưa gửi)
        GETDATE(),
        GETDATE(),
        @NguoiTao,
        @NguoiTao
    );

    IF @@ERROR <> 0
    BEGIN
        RAISERROR('Lỗi khi tạo thông báo mới', 16, 1);
    END
END
GO 