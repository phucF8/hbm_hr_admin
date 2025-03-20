public class Notification
    {
        public string ID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string SenderId { get; set; }
        public string TenNhanVien { get; set; }
        public string? TriggerAction { get; set; }
        public byte NotificationType { get; set; }
        public byte Status { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgaySua { get; set; }
        public string NguoiTao { get; set; }
        public string NguoiSua { get; set; }
    }