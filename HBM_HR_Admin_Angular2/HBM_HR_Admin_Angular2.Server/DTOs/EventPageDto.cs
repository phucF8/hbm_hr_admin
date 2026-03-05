using System.ComponentModel.DataAnnotations;

namespace HBM_HR_Admin_Angular2.Server.DTOs
{
    public class GetEventByIdRequest
    {
        [Required(ErrorMessage = "Id là bắt buộc")]
        public Guid Id { get; set; }
    }

    public class CreateEventPageRequest
    {
        [Required(ErrorMessage = "Title là bắt buộc")]
        [MaxLength(255, ErrorMessage = "Title không được vượt quá 255 ký tự")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "HtmlContent là bắt buộc")]
        public string HtmlContent { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int Version { get; set; } = 1;

        [Required(ErrorMessage = "StartTime là bắt buộc")]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int Priority { get; set; } = 0;
    }

    public class UpdateEventPageRequest
    {
        [Required(ErrorMessage = "Id là bắt buộc")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Title là bắt buộc")]
        [MaxLength(255, ErrorMessage = "Title không được vượt quá 255 ký tự")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "HtmlContent là bắt buộc")]
        public string HtmlContent { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public int Version { get; set; }

        [Required(ErrorMessage = "StartTime là bắt buộc")]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int Priority { get; set; }
    }

    public class DeleteEventRequest
    {
        [Required(ErrorMessage = "Id là bắt buộc")]
        public Guid Id { get; set; }
    }

    public class ToggleEventRequest
    {
        [Required(ErrorMessage = "Id là bắt buộc")]
        public Guid Id { get; set; }
    }
}
