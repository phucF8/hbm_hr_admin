namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class GopYChiTietRequest {
        public Guid Id { get; set; }   // Id góp ý cần lấy
    }

    public class FileDto {
        public string FileName { get; set; }
        public string FileUrl { get; set; }
    }

    public class GopYChiTietDto {
        public Guid Id { get; set; }
        public string NoiDung { get; set; }
        public string NhanVienId { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<FileDto> Files { get; set; }
    }
}

