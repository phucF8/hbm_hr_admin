using System;

namespace HBM_HR_Admin_Angular2.Server.Models
{
    public class Notification
    {
        public string ID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string SenderId { get; set; }
        public string TriggerAction { get; set; }
        public int NotificationType { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgaySua { get; set; }
        public string NguoiTao { get; set; }
        public string NguoiSua { get; set; }
    }

    public class CreateNotificationRequest
    {
        public string ID { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public byte NotificationType { get; set; }
        public string NguoiTao { get; set; } = string.Empty;
        public List<string> Recipients { get; set; } // Danh sách ID người nhận
    }

    public class UpdateNotificationRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public byte NotificationType { get; set; }
        public List<string> Recipients { get; set; } // Danh sách ID người nhận

    }

    public class TestSendNotificationRequest
    {
        public string NotificationID { get; set; } // ID thông báo
        public string IDNhanViens { get; set; } // Chuỗi các ID nhân viên cách nhau bằng dấu ','
        public string Title { get; set; }
        public string Body { get; set; }
        public Dictionary<string, string> Data { get; set; } // Dữ liệu bổ sung nếu cần
    }

    public class TestNotificationRequest
    {
        public string IDNhanVien { get; set; } // Chuỗi các ID nhân viên cách nhau bằng dấu ','
        public string Title { get; set; }
        public string Body { get; set; }
        public Dictionary<string, string> Data { get; set; } // Dữ liệu bổ sung nếu cần
        public int Badge { get; set; }
    }

} 