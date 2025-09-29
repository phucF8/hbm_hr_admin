namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class GopYByNhanVienRequest {
        public string NhanVienID { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string Search { get; set; }  // tùy chọn
    }

}
