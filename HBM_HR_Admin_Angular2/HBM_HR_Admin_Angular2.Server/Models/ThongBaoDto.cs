namespace HBM_HR_Admin_Angular2.Server.Models
{
    public class ThongBaoDto
    {
        public string ID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public byte NotificationType { get; set; }
        public string NguonUngDung { get; set; }
        public string LoaiThongBao { get; set; }
        public string? IDThamChieu { get; set; }
        public int Status { get; set; }
        public string Platform { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgaySua { get; set; }
        public string NguoiTao { get; set; }
        public string? NguoiSua { get; set; }
        public string TenNguoiTao { get; set; }
        public string AnhNguoiTao { get; set; }
        public List<NguoiNhanDto> DanhSachNguoiNhan { get; set; }
    }

}
