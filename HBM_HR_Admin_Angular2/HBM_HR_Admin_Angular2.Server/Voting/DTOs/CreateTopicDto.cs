namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class CreateTopicDto
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string CreatedBy { get; set; }

        public List<CreateQuestionDto>? Questions { get; set; }
    }


}
