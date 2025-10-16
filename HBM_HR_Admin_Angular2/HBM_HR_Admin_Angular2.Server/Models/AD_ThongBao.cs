using System;

namespace HBM_HR_Admin_Angular2.Server.Models {
    
    public class AD_ThongBao {
        public string ID { get; set; }
        public string? IDNotify { get; set; }
        public string? IDNguoiGui { get; set; }
        public DateTime NgayGui { get; set; }
        public string? NoiDung { get; set; }
        public DateTime NgayTao { get; set; }
        public string NguoiTao { get; set; }
        public DateTime? NgaySua { get; set; }
        public string? NguoiSua { get; set; }
        public string BusinessId { get; set; }
        public string? TrangThai { get; set; }
        public string TieuDe { get; set; }
        public string NhomThongBao { get; set; }
    }

}
