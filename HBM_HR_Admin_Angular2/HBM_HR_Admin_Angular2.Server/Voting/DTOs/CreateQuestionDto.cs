namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class CreateQuestionDto
    {
        public string Content { get; set; } = string.Empty;
        public int Order { get; set; }
        public int TopicId { get; set; }
    }

}
