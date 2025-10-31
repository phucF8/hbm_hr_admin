namespace HBM_HR_Admin_Angular2.Server.Requesters {

    public class NhacviecListRequest {
        public string UserID { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public string TrangThai { get; set; }
        public string Filter { get; set; }
        public string KeySearch { get; set; }
        public Guid? LoaiCongViecID { get; set; }

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

    public class DeleteListRequest {
        public List<string> IDs { get; set; } = new List<string>();
    }


    public class MarkCompleteRequest {
        public string ID { get; set; }
        public string TrangThai { get; set; } // ví dụ: "DangLam", "HoanThanh", "Huy"
    }

    public class UpdateTrangThaiRequestList {
        public List<string> IDs { get; set; } = new();
        public string TrangThai { get; set; } = ""; // thêm thuộc tính này
    }

    public class UserRequest {
        public string UserID { get; set; } = string.Empty;
    }

    public class UpdateViTriRequestList {
        public List<UpdateViTriItem> Items { get; set; } = new();
    }

    public class UpdateViTriItem {
        public Guid ID { get; set; }
        public int ThuTuHienThi { get; set; }
    }








}
