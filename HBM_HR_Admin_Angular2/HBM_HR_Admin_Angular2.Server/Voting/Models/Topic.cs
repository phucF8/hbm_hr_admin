using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Voting.Models
{
    [Table("BB_Topics")]
    public class Topic
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ICollection<Question> Questions { get; set; }

        /// <summary>
        /// 0 = Draft, 1 = Editing, 2 = Published, 3 = Cancelled
        /// </summary>
        public byte Status { get; set; } = 0;

        /// <summary>
        /// Thời gian phát hành
        /// </summary>
        public DateTime? PublishedAt { get; set; }

        /// <summary>
        /// Người phát hành
        /// </summary>
        public string? PublishedBy { get; set; }
    }
}
