namespace HBM_HR_Admin_Angular2.Server.DTOs {
    public class ThongBaoItemResponse {
        public string ID { get; set; } = string.Empty;
        public string? IDNotify { get; set; }
        public string? IDNguoiGui { get; set; }
        public DateTime NgayGui { get; set; }
        public string? NoiDung { get; set; }
        public string? TieuDe { get; set; }
        public string? NhomThongBao { get; set; }
        public string? TrangThai { get; set; }
        public string? BusinessId { get; set; }

        // --- Các trường mở rộng có thể dùng cho hiển thị ---
        public string? TenNguoiGui { get; set; }
        public string? AnhNguoiGui { get; set; }
        public bool IsRead { get; set; } = false;
    }
}
