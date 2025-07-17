namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class UpdateQuestionDto
    {
        public string Id { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int? OrderNumber { get; set; }
        public string? UpdatedBy { get; set; }

        public List<UpdateOptionDto> Options { get; set; } = new();
    }

    public class UpdateOptionDto
    {
        public string Id { get; set; } = default!; // Guid hoặc rỗng nếu thêm mới
        public string Content { get; set; } = default!;
        public int OrderNumber { get; set; }
    }

}
