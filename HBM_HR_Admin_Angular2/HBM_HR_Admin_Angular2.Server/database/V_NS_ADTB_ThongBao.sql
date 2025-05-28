-- Xóa view nếu đã tồn tại
IF EXISTS (SELECT * FROM sys.views WHERE name = 'V_NS_ADTB_ThongBao')
    DROP VIEW V_NS_ADTB_ThongBao;
GO

-- Tạo lại view V_NS_ADTB_ThongBao
CREATE VIEW V_NS_ADTB_ThongBao AS
SELECT
    n.ID,
    n.Title,
    n.Content,
    n.NotificationType,
    n.LoaiThongBao,
    n.Status,
    n.Platform,
    n.IDThamChieu,
    n.NgayTao,
    n.NguoiTao,
    n.NgaySua,
    n.NguoiSua,
    nt.TenNhanVien AS TenNguoiTao,
    nt.Anh AS AnhNguoiTao  -- Ảnh người tạo
FROM NS_ADTB_Notifications n
LEFT JOIN NS_NhanViens nt ON n.NguoiTao = nt.ID;
GO
