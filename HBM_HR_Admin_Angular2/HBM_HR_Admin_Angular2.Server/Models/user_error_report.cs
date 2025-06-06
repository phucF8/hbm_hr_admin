using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models
{
    [Table("UserErrorReport")]
    public class UserErrorReport
    {
        public int Id { get; set; }                          // Mã lỗi tự động tăng
        public string Username { get; set; }                 // Tên đăng nhập người dùng
        public string TenNhanVien { get; set; }              // Họ tên người dùng
        public string ApiUrl { get; set; }                   // URL API gây lỗi (nếu có)
        public string RequestJson { get; set; }              // Nội dung request
        public string ResponseJson { get; set; }             // Nội dung phản hồi lỗi
        public string VersionApp { get; set; }               // Phiên bản ứng dụng
        public string Device { get; set; }                   // Thiết bị: Android, iPhone, Web...
        public DateTime CreatedAt { get; set; } = DateTime.Now; // Thời điểm ghi nhận lỗi
        public string Notes { get; set; }                       //Ghi chú
    }

    public class UserErrorReportDto
    {
        public string Username { get; set; }
        public string TenNhanVien { get; set; }
        public string ApiUrl { get; set; }
        public string RequestJson { get; set; }
        public string ResponseJson { get; set; }
        public string VersionApp { get; set; }
        public string Device { get; set; }
        public string Notes { get; set; }
    }

}
