namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class NhacViecCreateRequest {
        public string UserID { get; set; }
        public string TieuDe { get; set; }
        public string MoTa { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public int NhacTruocPhut { get; set; }
        public string TanSuatLapLai { get; set; }
        public string MucDoUuTien { get; set; }
        public string LoaiCongViec { get; set; }
    }
}
