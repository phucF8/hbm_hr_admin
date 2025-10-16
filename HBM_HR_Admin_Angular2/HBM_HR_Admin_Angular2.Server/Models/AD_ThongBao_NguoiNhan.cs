namespace HBM_HR_Admin_Angular2.Server.Models {
    public class AD_ThongBao_NguoiNhan {
        public Guid ID { get; set; }
        public Guid IDThongBao { get; set; }
        public string IDNhanSu { get; set; }
        public byte? TrangThai { get; set; }
        public DateTime? NgayDoc { get; set; }
    }
}
