using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models {
    [Table("NV_NhacViec")]
    public class NV_NhacViec {
        public Guid ID { get; set; } = Guid.NewGuid();  // UNIQUEIDENTIFIER

        public string? UserID { get; set; }             // ID người nhận nhắc việc
        public string? TieuDe { get; set; }            // Tiêu đề nhắc việc
        public string? GhiChu { get; set; }            // Nội dung chi tiết / ghi chú
        public DateTime? NgayGioNhac { get; set; }     // Thời gian nhắc
        public string? LapLai { get; set; }            // Lặp lại: "HangNgay", "HangTuan", "HangThang", ...
        public string? MucDoUuTien { get; set; }       // "Cao", "TrungBinh", "Thap"
        public string? Tag { get; set; }               // Tag nhắc việc, ví dụ "BaoCao", "Hop", ...
        public string? TrangThai { get; set; } = "ChuaHoanThanh";  // "ChuaHoanThanh", "HoanThanh"
        public bool DaXoa { get; set; } = false;       // Xóa mềm
        public DateTime NgayTao { get; set; } = DateTime.Now;      // Ngày tạo
        public DateTime NgayCapNhat { get; set; } = DateTime.Now;  // Ngày cập nhật
        
        // ✅ Thêm cột IsSent
        public bool IsSent { get; set; }
    }
}
