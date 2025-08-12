using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Voting.Models
{
    [Table("BB_Options")]
    public class Option
    {
        public string Id { get; set; }
        public string QuestionId { get; set; }
        public string Content { get; set; }
        public int? OrderNumber { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Question Question { get; set; }
    }
}
