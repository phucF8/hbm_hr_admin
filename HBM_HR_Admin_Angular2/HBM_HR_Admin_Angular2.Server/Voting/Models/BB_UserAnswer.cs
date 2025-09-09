namespace HBM_HR_Admin_Angular2.Server.Voting.Models
{
    public class BB_UserAnswer
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string TopicId { get; set; }
        public string QuestionId { get; set; }
        public string? OptionId { get; set; }
        public string EssayAnswer { get; set; }
        public DateTime? AnsweredAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

}
