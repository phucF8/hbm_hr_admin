using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("NS_ADTB_Notifications")]
public class ThongBao
{
    public string ID { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
   
    public byte NotificationType { get; set; }
    public string? NguonUngDung { get; set; }
    public string? LoaiThongBao { get; set; }
    public string? IDThamChieu { get; set; }
    public byte Status { get; set; }
    public string? Platform { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime? NgaySua { get; set; }
    public string NguoiTao { get; set; }
    public string? NguoiSua { get; set; }

    //public List<V_NS_ADTB_NhanThongBao> Recipients { get; set; } = new();

}

[Table("V_NS_ADTB_NhanThongBao")]
public class V_NS_ADTB_NhanThongBao
{
    [Key]
    public string ID { get; set; }

    public string IDThongBao { get; set; }

    public string NguoiNhan { get; set; }

    public string? TenNguoiNhan { get; set; }

    public string? AnhNguoiNhan { get; set; }

    public byte? TrangThaiNhan { get; set; }

    [ForeignKey("IDThongBao")]
    public ThongBao Notification { get; set; }
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

    public string NguoiNhan { get; set; }
}

