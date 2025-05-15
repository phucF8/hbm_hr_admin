public class Notification
{
        public string ID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string TenNhanVien { get; set; }
        public int NotificationType { get; set; }
        public string LoaiThongBao { get; set; }
        public string IDThamChieu { get; set; }
        public byte Status { get; set; }
        public string Platform { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgaySua { get; set; }
        public string NguoiTao { get; set; }
        public string NguoiSua { get; set; }
        public int TotalCount { get; set; }
        
         public List<NotificationRecipient> Recipients { get; set; } = new List<NotificationRecipient>();

         // Total number of recipients (provided in the response)
         public int TotalRecipients { get; set; }

         // Number of recipients who have received the notification (provided in the response)
         public int ReceivedCount { get; set; }

}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
}


public class NotificationRecipient
{
    public string ID { get; set; } // Khóa chính
    public string NotificationId { get; set; }
    public string RecipientId { get; set; }
    public string TenNhanVien { get; set; } = string.Empty;
    public string Anh { get; set; } = string.Empty;
    public string TenChucDanh { get; set; } = string.Empty;
    public string TenPhongBan { get; set; } = string.Empty;
    public string TenKho { get; set; } = string.Empty;
    public byte Status { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime NgaySua { get; set; }
    public string NguoiTao { get; set; }
    public string NguoiSua { get; set; }
}

