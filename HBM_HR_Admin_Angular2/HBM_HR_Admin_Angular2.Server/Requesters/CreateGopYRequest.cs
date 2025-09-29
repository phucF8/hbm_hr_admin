namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class CreateGopYRequest {
        public string? NhanVienID { get; set; }  // null = nặc danh
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public List<IFormFile>? Files { get; set; }  // file đính kèm (nếu có)
    }
}
