namespace HBM_HR_Admin_Angular2.Server.Requesters {
    // Tham số đầu vào (client gửi lên dạng JSON)
    public class GopYQueryRequest {
        public int PageNumber { get; set; } = 1;   // Trang hiện tại
        public int PageSize { get; set; } = 10;    // Số bản ghi mỗi trang
        public string? Search { get; set; }        // Từ khóa tìm kiếm (nếu có)
    }

    // Dữ liệu trả về
    public class GopYResponse {
        public Guid ID { get; set; }
        public string? NhanVienID { get; set; }   // NULL nếu nặc danh
        public string NoiDung { get; set; }
        public DateTime NgayGui { get; set; }
        public string TrangThai { get; set; }
    }

    // Kết quả phân trang chung
    public class PagedResultGopY {
        public long TotalItems { get; set; } = 0;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public List<GopYResponse> Items { get; set; } = new List<GopYResponse>();
    }


}
