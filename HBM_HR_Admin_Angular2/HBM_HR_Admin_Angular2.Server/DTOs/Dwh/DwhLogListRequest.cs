using System.ComponentModel.DataAnnotations;

namespace HBM_HR_Admin_Angular2.Server.DTOs.Dwh {
    public class DwhLogListRequest {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;

        // Optional filters
        public int? IdJob { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Search { get; set; }
    }
}
