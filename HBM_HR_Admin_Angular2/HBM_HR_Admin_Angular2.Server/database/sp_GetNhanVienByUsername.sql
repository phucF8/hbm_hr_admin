CREATE PROCEDURE sp_GetNhanVienByUsername
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [ID],
        [UserID],
        [Username],
        [TenNhanVien],
        [IDKhoLamViec],
        [TenKho],
        [IDPhongBan],
        [TenPhongBan],
        [IDChucDanh],
        [TenChucDanh]
    FROM [HBM_HCNSApp].[dbo].[NS_NhanViens]
    WHERE [Username] = @Username;
END


EXEC sp_GetNhanVienByUsername @Username = 'phucnh@hbm.vn';
EXEC sp_GetNhanVienByUsername @Username = 'huongqtt@hbm.vn';
EXEC sp_GetNhanVienByUsername @Username = 'trungqtt@hbm.vn';
