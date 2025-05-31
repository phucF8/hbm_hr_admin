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
        nv.TenNhanVien as TenNguoiTao,
        nv.Anh as AnhNguoiTao,
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