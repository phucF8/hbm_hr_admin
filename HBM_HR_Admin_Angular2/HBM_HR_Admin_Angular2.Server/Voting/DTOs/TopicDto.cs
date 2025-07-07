namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class TopicDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
