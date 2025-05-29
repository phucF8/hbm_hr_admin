namespace HBM_HR_Admin_Angular2.Server.Models
{
    public class NguoiNhanDto
    {
        public string ID { get; set; }
        public string IDThongBao { get; set; }
        public string NguoiNhan { get; set; }
        public string TenNguoiNhan { get; set; }
        public string AnhNguoiNhan { get; set; }


        public string MaNhanVien { get; set; }
        public string TenChucDanh { get; set; }
        public string TenPhongBan {  get; set; }        


        public byte Status { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgaySua { get; set; }
    }

}
