namespace HBM_HR_Admin_Angular2.Server.DTOs {
    public class TopicReleaseRequest {
        public string TopicId { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;  // 'EMPLOYEE', 'PHONGBAN', 'CHUCDANH', 'KHO'
        public string TargetId { get; set; } = string.Empty;    // Id đối tượng
        public string ReleasedBy { get; set; } = string.Empty;  // Người phát hành
        public string? Note { get; set; }
    }

}
