namespace HBM_HR_Admin_Angular2.Server.DTOs {
    // DTO dùng để trả về thông tin chi tiết
    public class NV_NhacViecDetailDto {
        public Guid ID { get; set; }
        public string? UserID { get; set; }
        public string? TieuDe { get; set; }
        public string? GhiChu { get; set; }
        public DateTime? NgayGioNhac { get; set; }
        public string? LapLai { get; set; }
        public string? MucDoUuTien { get; set; }
        public string? Tag { get; set; }
        public string? TrangThai { get; set; }
        public bool DaXoa { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgayCapNhat { get; set; }
        public bool IsSent { get; set; }
        public Guid? LoaiCongViecID { get; set; }

        // 👇 Thêm tên loại công việc
        public string? TenLoaiCongViec { get; set; }
    }
}
