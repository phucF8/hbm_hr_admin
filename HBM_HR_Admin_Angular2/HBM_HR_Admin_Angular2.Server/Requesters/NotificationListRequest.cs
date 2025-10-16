namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class NotificationListRequest {
        public string? UserID { get; set; }
        public string? NhomThongBao { get; set; }     // VD: "GY", "HR", ...
        public string? TrangThai { get; set; }         // VD: "Chưa đọc", "Đã đọc", ...
        public int PageNumber { get; set; } = 1;       // Trang hiện tại
        public int PageSize { get; set; } = 20;        // Số bản ghi mỗi trang
    }
}
