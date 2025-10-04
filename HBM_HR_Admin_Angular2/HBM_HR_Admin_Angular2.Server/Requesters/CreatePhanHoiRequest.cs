using HBM_HR_Admin_Angular2.Server.Models;

namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class CreatePhanHoiRequest {
        public Guid GopYID { get; set; }
        public string NoiDung { get; set; } = string.Empty;
        public Guid? NguoiPhanHoiID { get; set; }
        public List<GY_FileDinhKem>? Files { get; set; }  // chỉ metadata
    }
}
