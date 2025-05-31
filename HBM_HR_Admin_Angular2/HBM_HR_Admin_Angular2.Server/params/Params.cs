public class NotificationPagingRequest
{
    public int? pageIndex { get; set; }
    public int? NotificationType { get; set; }
    public string? LoaiThongBao { get; set; }
    public string? Platform { get; set; }
    public DateTime? ngayTaoTu { get; set; }
    public DateTime? ngayTaoDen { get; set; }
    public string? SearchText { get; set; }
    public string? NgTaoIds { get; set; }
    public string? NgNhanIds { get; set; }
    public List<string>? NguoiNhanIds { get; set; }
    public string? SortBy { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int? isSentToAll { get; set; } // Added property to fix the error
}