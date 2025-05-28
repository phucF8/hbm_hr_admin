IF EXISTS (SELECT * FROM sys.views WHERE name = 'V_NS_ADTB_NhanThongBao')
    DROP VIEW V_NS_ADTB_NhanThongBao;
GO

CREATE VIEW V_NS_ADTB_NhanThongBao AS
SELECT
    r.IDThongBao,
    r.NguoiNhan,
    nv.TenNhanVien AS TenNguoiNhan,
    nv.Anh AS AnhNguoiNhan,
    r.Status AS TrangThaiNhan
FROM NS_ADTB_NotificationRecipients r
LEFT JOIN NS_NhanViens nv ON r.NguoiNhan = nv.ID
LEFT JOIN NS_ADTB_Notifications n ON r.IDThongBao = n.ID;
