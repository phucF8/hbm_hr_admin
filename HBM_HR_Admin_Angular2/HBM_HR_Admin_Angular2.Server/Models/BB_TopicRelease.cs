using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models {
    [Table("BB_TopicRelease")]
    public class BB_TopicRelease {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string TopicId { get; set; }

        [Required]
        public string TargetType { get; set; }

        [Required]
        public string TargetId { get; set; }

        [Required]
        public string ReleasedBy { get; set; }

        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
    }

}
