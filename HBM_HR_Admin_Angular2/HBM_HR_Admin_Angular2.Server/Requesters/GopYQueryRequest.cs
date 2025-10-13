namespace HBM_HR_Admin_Angular2.Server.Requesters {
    // Tham số đầu vào (client gửi lên dạng JSON)
    public class GopYQueryRequest {
        public string userId { get; set; }          //vì tạm thời chưa gửi dio.options.headers['Authorization'] = 'Bearer $token'; mỗi lần request nên truyền userId theo
        public string TypeRequest { get; set; }     //vì lúc thì muốn lấy ds góp ý gửi bởi tôi, lúc thì ds góp ý gửi tới tôi
        public int PageNumber { get; set; } = 1;   // Trang hiện tại
        public int PageSize { get; set; } = 10;    // Số bản ghi mỗi trang
        public string? Search { get; set; }        // Từ khóa tìm kiếm (nếu có)
    }

    // Dữ liệu trả về
    public class GopYResponse {
        public Guid ID { get; set; }
        public string TieuDe { get; set; }
        public string? NhanVienID { get; set; }   // NULL nếu nặc danh
        public string NoiDung { get; set; }
        public DateTime NgayGui { get; set; }
        public string TrangThai { get; set; }
        public string MaTraCuu { get; set; }

        // 👇 vì cần hiển thị tên, ảnh, chức danh người nhận & người gửi
        public string? TenNguoiGui { get; set; }
        public string? AnhNguoiGui { get; set; }
        public string? TenChucDanhNguoiGui { get; set; }

        public string? TenNguoiNhan { get; set; }
        public string? AnhNguoiNhan { get; set; }
        public string? TenChucDanhNguoiNhan { get; set; }
    }

    // Kết quả phân trang chung
    public class PagedResultGopY {
        public long TotalItems { get; set; } = 0;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public List<GopYResponse> Items { get; set; } = new List<GopYResponse>();
    }


}
