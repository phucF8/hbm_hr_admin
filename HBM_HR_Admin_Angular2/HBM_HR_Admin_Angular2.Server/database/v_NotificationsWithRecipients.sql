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
    n.Status AS NotificationStatus,
    n.Platform,
    n.NgayTao,
    n.NguoiTao,
    nt.TenNhanVien AS TenNguoiTao,
    nt.Anh AS AnhNguoiTao,         -- Thêm ảnh người tạo
    r.NguoiNhan,
    nr.TenNhanVien AS TenNguoiNhan,
	nr.Anh AS AnhNguoiNhan,
    r.Status AS RecipientStatus
FROM NS_ADTB_Notifications n
LEFT JOIN NS_NhanViens nt ON n.NguoiTao = nt.ID       -- Người tạo
LEFT JOIN NS_ADTB_NotificationRecipients r ON n.ID = r.IDThongBao 	-- 
LEFT JOIN NS_NhanViens nr ON r.NguoiNhan = nr.ID;     -- Người nhận
