using HBM_HR_Admin_Angular2.Server.Models;

namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class PhanHoiCreateRequest {
        public Guid GopYID { get; set; }
        public string NoiDung { get; set; }
        public string? NguoiPhanHoiID { get; set; }
        public List<GY_FileDinhKem>? Files { get; set; }
    }

    public class SetGroupRequest {
        public Guid GopYID { get; set; }      // ID của phản hồi cần gán nhóm
        public Guid GroupID { get; set; }     // ID nhóm cần gán
    }


}
