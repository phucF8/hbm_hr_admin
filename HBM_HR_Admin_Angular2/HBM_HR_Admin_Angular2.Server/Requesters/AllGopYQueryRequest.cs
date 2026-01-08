namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class AllGopYQueryRequest {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string? Search { get; set; }
        public string? TrangThai { get; set; }
        public string? FilterType { get; set; } // Dùng để lọc GroupID
    }
}