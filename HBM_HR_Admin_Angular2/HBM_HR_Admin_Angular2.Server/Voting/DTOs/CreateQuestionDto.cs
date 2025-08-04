namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class CreateQuestionDto
    {
        public string? Id { get; set; } // Cho phép truyền hoặc để null
        public string Content { get; set; }
        public string Type { get; set; }
        public int OrderNumber { get; set; }

        public List<CreateOptionDto>? Options { get; set; }
    }

    public class CreateOptionDto
    {
        public string? Id { get; set; }
        public string Content { get; set; }
        public int OrderNumber { get; set; }
    }


}
