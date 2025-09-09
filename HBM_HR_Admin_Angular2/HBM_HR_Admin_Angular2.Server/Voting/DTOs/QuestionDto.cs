namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class QuestionDto
    {
        public string Id { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int? OrderNumber { get; set; }
        public List<OptionDto> Options { get; set; } = new();
        public List<UserAnswerDto> UserAnswers { get; set; } = new();  // thay vì UserAnswer
                                                                      
        public List<EssayAnswerDto> EssayAnswers { get; set; }   // Thêm danh sách câu trả lời tự luận
    }

    public class OptionDto
    {
        public string Id { get; set; }
        public string Content { get; set; }
        public int? OrderNumber { get; set; }
        
        public int SelectedCount { get; set; }  // Số lượng user đã chọn option này
        
    }

    public class EssayAnswerDto {
        public string UserId { get; set; }
        public string EssayAnswer { get; set; }
        public DateTime? CreatedAt { get; set; }
    }


}
