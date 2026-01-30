using System.ComponentModel.DataAnnotations;

namespace HBM_HR_Admin_Angular2.Server.DTOs.Dwh {
    public class DwhEtlJobLogChiTietDto {
        public Guid Id { get; set; }
        public int IdJob { get; set; }
        public string JobName { get; set; } = null!;
        public DateTime LogDate { get; set; }
        public int Errors { get; set; }
        public string? LogField { get; set; }
        public DateTime CreatedAt { get; set; }
    }



}