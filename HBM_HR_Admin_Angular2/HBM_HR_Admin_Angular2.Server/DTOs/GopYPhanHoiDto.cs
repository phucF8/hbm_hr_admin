using HBM_HR_Admin_Angular2.Server.Requesters;

namespace HBM_HR_Admin_Angular2.Server.DTOs {
    public class GopYPhanHoiDto {
        public Guid ID { get; set; }
        public Guid GopYID { get; set; }
        public string? NoiDung { get; set; }
        public DateTime NgayPhanHoi { get; set; }

        public string? NguoiPhanHoiID { get; set; }

        // 👇 Thông tin người gửi phản hồi
        public string? TenNguoiGui { get; set; }
        public string? AnhNguoiGui { get; set; }
        public string? TenChucDanhNguoiGui { get; set; }

        // (Tuỳ chọn) File đính kèm phản hồi
        public List<FileDto>? Files { get; set; }
    }

}
