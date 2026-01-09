namespace HBM_HR_Admin_Angular2.Server.Requesters {

    public class AdminGopYChiTietRequest {
        public Guid Id { get; set; }   // Id góp ý cần lấy
    }

    public class GopYChiTietRequest {
        public Guid Id { get; set; }   // Id góp ý cần lấy
        public String UserID { get; set; }   // Id nguoi xem chi tiet góp ý
    }

    public class FileDto {
        public string FileName { get; set; }
        public string FileUrl { get; set; }
    }

    public class GopYChiTietDto {
        public Guid Id { get; set; }
        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public string NhanVienId { get; set; }
        public bool AnDanh { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<FileDto> Files { get; set; }

        // 👇 Group
        public string? GroupID { get; set; }

        // 👇 Thông tin người gửi
        public string? TenNguoiGui { get; set; }
        public string? AnhNguoiGui { get; set; }
        public string? TenChucDanhNguoiGui { get; set; }

        // 👇 Thông tin người nhận
        public string? TenNguoiNhan { get; set; }
        public string? AnhNguoiNhan { get; set; }
        public string? TenChucDanhNguoiNhan { get; set; }
    }
}

