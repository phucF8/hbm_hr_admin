using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using HBM_HR_Admin_Angular2.Server.Voting.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;


namespace HBM_HR_Admin_Angular2.Server.Voting.controllers
{
    [ApiController]
    [Route("api/topics")]
    public class TopicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITopicService _service;

        public TopicController(ApplicationDbContext context, ITopicService service)
        {
            _context = context;
            _service = service;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTopic([FromBody] CreateTopicDto dto)
        {
            var topic = await _service.CreateAsync(dto);
            if (topic == null)
                return BadRequest(ApiResponse<string>.Error("Tạo chủ đề thất bại"));
            return Ok(ApiResponse<object>.Success(topic, "Tạo chủ đề thành công"));
        }

        [HttpGet]
        public async Task<IActionResult> GetPagedTopics([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _service.GetPagedTopicsAsync(page, pageSize);
            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> DeleteTopic(string id)
        {
            var success = await _service.DeleteTopicAsync(id);
            if (!success)
                return NotFound(ApiResponse<string>.Error("Topic not found"));

            return Ok(ApiResponse<object>.Success("Xoá Topic thành công"));
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateTopic([FromBody] UpdateTopicDto dto)
        {
            var updated = await _service.UpdateTopicAsync(dto);
            if (updated == null)
                return NotFound(ApiResponse<string>.Error("Không tìm thấy chủ đề cần sửa"));

            return Ok(ApiResponse<object>.Success(updated, "Cập nhật chủ đề thành công"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var topic = await _service.GetTopicByIdAsync(id);
            if (topic == null)
                return NotFound(ApiResponse<string>.Error("Không tìm thấy chủ đề"));
            return Ok(ApiResponse<object>.Success(topic, "Thành công"));
        }

        // DELETE: api/topics/DeleteList
        [HttpPost("DeleteList")]
        public async Task<IActionResult> DeleteTopics([FromBody] List<string> topicIds)
        {
            if (topicIds == null || topicIds.Count == 0)
                return BadRequest("Danh sách Id rỗng.");

            var topicsToDelete = await _context.Topics
                .Where(t => topicIds.Contains(t.Id))
                .ToListAsync();

            if (topicsToDelete.Count == 0)
                return NotFound(ApiResponse<object>.Error("Không tìm thấy topic nào để xoá."));

            _context.Topics.RemoveRange(topicsToDelete);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Success(topicsToDelete.Count,"Đã xoá thành công"));
        }

        [HttpGet("voting/{id}")]
        public async Task<ActionResult<TopicVotingDto>> GetTopicWithQuestions(string id)
        {
            var topic = await _context.Topics
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (topic == null)
                return NotFound();

            var result = new TopicVotingDto
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description,
                StartDate = topic.StartDate,
                EndDate = topic.EndDate,
                Questions = topic.Questions
                    .OrderBy(q => q.OrderNumber)
                    .Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        Content = q.Content,
                        Type = q.Type,
                        OrderNumber = q.OrderNumber,
                        Options = q.Options
                            .OrderBy(o => o.OrderNumber)
                            .Select(o => new OptionDto
                            {
                                Id = o.Id,
                                Content = o.Content,
                                OrderNumber = o.OrderNumber
                            }).ToList()
                    }).ToList()
            };

            return Ok(result);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitAnswers([FromBody] List<UserAnswerDto> answers)
        {
            if (answers == null || !answers.Any())
            {
                return BadRequest(new { message = "Không có câu trả lời nào được gửi" });
            }

            //var userId = "USER_ID_LOGIN"; // TODO: lấy từ token hoặc session
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var now = DateTime.UtcNow;

            foreach (var ans in answers)
            {
                var entity = new BB_UserAnswer
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    QuestionId = ans.QuestionId,
                    OptionId = ans.OptionId,
                    EssayAnswer = ans.EssayAnswer,
                    AnsweredAt = now,
                    CreatedBy = userId,
                    CreatedAt = now
                };

                _context.BB_UserAnswers.Add(entity);
            }

            await _context.SaveChangesAsync();

            return Ok(new { status = "SUCCESS", message = "Lưu câu trả lời thành công" });
        }

    }


}
