namespace HBM_HR_Admin_Angular2.Server.Requesters {

    public class NhacviecListRequest {
        public string UserID { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public string TrangThai { get; set; }
        public string Filter { get; set; }
        public string KeySearch { get; set; }

        // 👉 Thêm cho phân trang
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
    public class NhacViecDetailRequest {
        public string ID { get; set; }
    }

    public class NhacViecDeleteRequest {
        public string ID { get; set; }
    }

    public class NhacViecDeleteListRequest {
        public List<string> IDs { get; set; } = new List<string>();
    }


    public class MarkCompleteRequest {
        public string ID { get; set; }
        public string TrangThai { get; set; } // ví dụ: "DangLam", "HoanThanh", "Huy"
    }

    public class MarkCompleteRequestList {
        public List<string> IDs { get; set; } = new();
        public string TrangThai { get; set; } = ""; // thêm thuộc tính này
    }

}
