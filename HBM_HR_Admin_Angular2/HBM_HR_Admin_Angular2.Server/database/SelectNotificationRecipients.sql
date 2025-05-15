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
        nv.Anh,
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
GO
--
-- Example usage:
EXEC SelectNotificationRecipients @NotificationId = '0016b50603984b92'
