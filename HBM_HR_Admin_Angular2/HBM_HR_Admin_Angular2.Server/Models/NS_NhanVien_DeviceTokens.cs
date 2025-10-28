namespace HBM_HR_Admin_Angular2.Server.Models {
    public class NS_NhanVien_DeviceTokens {
        public string ID { get; set; }                 // Khóa chính
        public string IDNhanVien { get; set; }         // ID nhân viên
        public string DeviceToken { get; set; }     // FCM token của thiết bị
        public string DeviceName { get; set; }      // Tên thiết bị
        public DateTime NgayTao { get; set; }       // Ngày tạo
        public string NguoiTao { get; set; }       // Người tạo
        public DateTime? NgaySua { get; set; }      // Ngày sửa
        public string NguoiSua { get; set; }       // Người sửa
        public string Versions { get; set; }        // Phiên bản app/device

        // Nếu muốn liên kết với bảng nhân viên
        // public virtual NS_NhanVien NhanVien { get; set; }
    }
}
