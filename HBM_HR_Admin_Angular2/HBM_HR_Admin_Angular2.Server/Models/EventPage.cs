using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models
{
    [Table("EventPages")]
    public class EventPage
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string HtmlContent { get; set; }

        public bool IsActive { get; set; } = true;

        public int Version { get; set; } = 1;

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int Priority { get; set; } = 0;
    }
}
