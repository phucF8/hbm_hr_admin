using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models {
    

    [Table("GY_GopYs")]
    public class GY_GopY {
        [Key]
        public Guid ID { get; set; }
        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public string? NhanVienID { get; set; }
        public string NguoiNhanID { get; set; } // 👈 vì góp ý thì phải gửi cho ai đó
        public string MaTraCuu { get; set; }
        public string TrangThai { get; set; }
        public DateTime NgayGui { get; set; }

        public ICollection<GY_FileDinhKem> Files { get; set; } = new List<GY_FileDinhKem>();
    }

    [Table("GY_FileDinhKems")]
    public class GY_FileDinhKem {
        [Key]
        public Guid ID { get; set; }            // Primary key

        public Guid? GopYID { get; set; }       // Có thể null nếu file thuộc về phản hồi
        public Guid? PhanHoiID { get; set; }    // Có thể null nếu file thuộc về góp ý

        [Required]
        [MaxLength(255)]
        public string TenFile { get; set; }

        [Required]
        [MaxLength(500)]
        public string DuongDan { get; set; }

        public DateTime? NgayTai { get; set; }  // Cho phép null như DB

        // Navigation properties
        public GY_GopY? GopY { get; set; }
        public GY_PhanHoi? PhanHoi { get; set; }
    }


    [Table("GY_PhanHois")]
    public class GY_PhanHoi {
        [Key]
        public Guid ID { get; set; }              // Khóa chính

        public Guid GopYID { get; set; }          // Liên kết tới góp ý nào
        public string? NguoiPhanHoiID { get; set; }     // Người phản hồi (có thể null nếu hệ thống phản hồi tự động)

        [Required]
        [MaxLength(500)]
        public string NoiDung { get; set; }       // Nội dung phản hồi

        public DateTime NgayPhanHoi { get; set; }     // Ngày phản hồi

        // Nếu bạn muốn lấy kèm file thì có thể định nghĩa navigation property:
        public ICollection<GY_FileDinhKem> FileDinhKems { get; set; }
    }

    


    }
