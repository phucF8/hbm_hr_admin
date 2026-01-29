using System.ComponentModel.DataAnnotations;

namespace HBM_HR_Admin_Angular2.Server.DTOs.Dwh {
    public class CreateEtlJobLogRequest {
        [Required]
        public int ID_JOB { get; set; }

        [Required]
        public string JobName { get; set; }

        [Required]
        public DateTime LogDate { get; set; }

        public int Errors { get; set; } = 0;

        public string LogField { get; set; }

        
    }

}