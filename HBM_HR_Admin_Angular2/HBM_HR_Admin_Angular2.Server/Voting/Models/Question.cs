using HBM_HR_Admin_Angular2.Server.Voting.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("BB_Questions")]
public class Question
{
    public string Id { get; set; }
    public string TopicId { get; set; }
    public string Content { get; set; }
    public string Type { get; set; }
    public int? OrderNumber { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Topic Topic { get; set; }
    public ICollection<Option> Options { get; set; }

}


public enum QuestionType
{
    SingleChoice,
    MultiChoice,
    Essay
}
