namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class CreatePhanHoiRequest {
        public Guid GopYID { get; set; }        // ID của góp ý cần phản hồi
        public Guid? NhanVienID { get; set; }   // Người phản hồi
        public string NoiDung { get; set; }     // Nội dung phản hồi
        public List<IFormFile>? Files { get; set; } // File đính kèm (tùy chọn)
    }
}
