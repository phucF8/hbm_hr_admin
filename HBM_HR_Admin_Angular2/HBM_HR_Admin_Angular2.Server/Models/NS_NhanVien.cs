using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models
{
    [Table("NS_NhanViens")]
    public class NS_NhanVien
    {
        public string ID { get; set; }
        public string UserID { get; set; }
        public string Username { get; set; }
        public string MaNhanVien { get; set; }
        public string TenNhanVien { get; set; }
        public string IDKhoLamViec { get; set; }
        public string TenKho { get; set; }
        public string IDPhongBan { get; set; }
        public string TenPhongBan { get; set; }
        public int? IDChucDanh { get; set; } // Dữ liệu unchecked nên có thể null
        public string TenChucDanh { get; set; }
        public string Anh { get; set; }
    }
}



