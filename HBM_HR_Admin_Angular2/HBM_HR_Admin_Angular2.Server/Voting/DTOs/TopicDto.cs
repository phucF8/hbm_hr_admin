namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class TopicDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public string? CreatedByName { get; set; }
        public string? UpdatedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<QuestionDto> Questions { get; set; } = new();

    }

    public class TopicVotingDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }
}
