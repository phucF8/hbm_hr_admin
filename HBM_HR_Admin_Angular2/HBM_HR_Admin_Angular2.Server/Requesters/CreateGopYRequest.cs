using HBM_HR_Admin_Angular2.Server.Models;

namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class CreateGopYRequest {
        public Guid Id { get; set; }
        public string? NhanVienID { get; set; }  // null = nặc danh
        public string NguoiNhanID { get; set; }  // vì tạo góp ý là phải gửi cho ai đó nên không thể null
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public List<GY_FileDinhKem>? Files { get; set; }  // chỉ metadata
    }
}
