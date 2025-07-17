using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Voting.Models
{
    [Table("BB_Options")]
    public class Option
    {
        public string Id { get; set; } = default!;
        public string QuestionId { get; set; } = default!;
        public string Content { get; set; } = default!;
        public int OrderNumber { get; set; }
        public string CreatedBy { get; set; } = default!;
        public string? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
