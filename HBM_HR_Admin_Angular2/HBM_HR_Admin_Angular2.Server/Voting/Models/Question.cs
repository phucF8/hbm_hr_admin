using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("BB_Questions")]
public class Question
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string TopicId { get; set; } = null!;

    [Required]
    public string Content { get; set; } = null!;

    [Required]
    [EnumDataType(typeof(QuestionType))]
    public string Type { get; set; } = "SingleChoice"; // Hoặc bạn có thể dùng enum thật sự

    public int? OrderNumber { get; set; }

    [Required]
    public string CreatedBy { get; set; } = null!;

    public string? UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime? UpdatedAt { get; set; }

    // Navigation property (nếu có)
    // public Topic Topic { get; set; } = null!;
}


public enum QuestionType
{
    SingleChoice,
    MultiChoice,
    Essay
}
