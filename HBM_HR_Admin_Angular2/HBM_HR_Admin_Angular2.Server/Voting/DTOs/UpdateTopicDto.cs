namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class UpdateTopicDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
        public List<UpdateQuestionDto> Questions { get; set; } = new();
    }

}
