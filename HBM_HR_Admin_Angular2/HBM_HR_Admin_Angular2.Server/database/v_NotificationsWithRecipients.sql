IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_NotificationsWithRecipients')
    DROP VIEW v_NotificationsWithRecipients;
GO

CREATE VIEW v_NotificationsWithRecipients AS
SELECT
    n.ID,
    n.Title,
    n.Content,
    n.NotificationType,
    n.LoaiThongBao,
	n.Status,
    n.Platform,
    n.NgayTao,
    n.NguoiTao,
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
    n.LoaiThongBao,
	n.Status,
    n.Platform,
    n.NgayTao,
	n.NguoiTao,
    nv.TenNhanVien;
