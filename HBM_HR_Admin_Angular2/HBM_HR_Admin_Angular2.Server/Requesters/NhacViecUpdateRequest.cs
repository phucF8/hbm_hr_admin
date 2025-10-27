namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class NhacViecUpdateRequest : NhacViecCreateRequest {
        public Guid ID { get; set; }
        public string TrangThai { get; set; }
    }
}
