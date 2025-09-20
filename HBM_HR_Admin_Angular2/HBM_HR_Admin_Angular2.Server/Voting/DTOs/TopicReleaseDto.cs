namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs {
    public class TopicReleaseDto {
        public string Id { get; set; }
        public string TopicId { get; set; }
        public string TargetType { get; set; }
        public string TargetId { get; set; }
        public string ReleasedBy { get; set; }
        public string Note { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Thông tin nhân sự (chỉ khi TargetType = "NHANSU")
        public string Anh { get; set; }
        public string TenNhanVien { get; set; }
        public string TenPhongBan { get; set; }
        public string TenChucDanh { get; set; }
        public string MaNhanVien { get; set; }
    }
}
