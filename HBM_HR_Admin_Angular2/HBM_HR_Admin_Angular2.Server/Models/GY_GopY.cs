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
        public string MaTraCuu { get; set; }
        public string TrangThai { get; set; }
        public DateTime NgayGui { get; set; }

        public ICollection<GY_FileDinhKem> Files { get; set; } = new List<GY_FileDinhKem>();
    }

    [Table("GY_FileDinhKems")]
    public class GY_FileDinhKem {
        [Key]
        public Guid ID { get; set; }
        public Guid GopYID { get; set; }
        public string TenFile { get; set; }
        public string DuongDan { get; set; }
        public DateTime NgayTai { get; set; }
    }

}
