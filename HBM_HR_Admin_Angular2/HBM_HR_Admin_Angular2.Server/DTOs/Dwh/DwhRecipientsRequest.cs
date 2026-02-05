using System.ComponentModel.DataAnnotations;

namespace HBM_HR_Admin_Angular2.Server.DTOs.Dwh {
    public class DwhRecipientsRequest {
        [Required]
        public Guid JobLogId { get; set; }

        [Required]
        public List<Guid> UserIds { get; set; } = new List<Guid>();
    }
}
