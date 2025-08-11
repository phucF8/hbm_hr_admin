using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using HBM_HR_Admin_Angular2.Server.Voting.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace HBM_HR_Admin_Angular2.Server.Voting.Controllers
{
    [ApiController]
    [Route("api/questions")]
    public class QuestionsController:ControllerBase 
    {
        private readonly ApplicationDbContext _context;

        public QuestionsController(ApplicationDbContext context, ITopicService service)
        {
            _context = context;
            //_service = service;
        }

        [HttpGet("by-topic/{topicId}")]
        public async Task<IActionResult> GetQuestionsByTopic(string topicId)
        {
            var questions = await _context.Questions
                .Where(q => q.TopicId == topicId)
                .OrderBy(q => q.OrderNumber) // ✅ sửa lại tên đúng
                .ToListAsync();

            return Ok(ApiResponse<object>.Success(questions));
        }


        [HttpPost("add")]
        public async Task<IActionResult> AddQuestion([FromBody] Question question)
        {
            if (!_context.Topics.Any(t => t.Id == question.TopicId))
                return BadRequest("Topic không tồn tại.");

            question.CreatedAt = DateTime.Now;

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Success(question, "Tạo thành công"));
        }

        [HttpPost("delete")]
        public async Task<IActionResult> DeleteQuestions([FromBody] List<string> questionIds)
        {
            if (questionIds == null || !questionIds.Any())
                return BadRequest(ApiResponse<string>.Error("Danh sách ID không hợp lệ."));

            var questions = await _context.Questions
                .Where(q => questionIds.Contains(q.Id))
                .ToListAsync();

            if (!questions.Any())
                return NotFound(ApiResponse<string>.Error("Không tìm thấy câu hỏi nào."));

            _context.Questions.RemoveRange(questions);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Success(new { deleted = questions.Count }, "Xoá thành công"));
        }


        [HttpPost("{id}")]
        public async Task<IActionResult> UpdateQuestion(string id, [FromBody] UpdateQuestionDto dto)
        {
            if (id != dto.Id)
                return BadRequest(ApiResponse<string>.Error("ID không khớp."));

            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                return NotFound(ApiResponse<string>.Error("Không tìm thấy câu hỏi."));

            question.Content = dto.Content;
            question.Type = dto.Type;
            question.OrderNumber = dto.OrderNumber;
            question.UpdatedBy = dto.UpdatedBy;
            question.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Success(question, "Cập nhật thành công"));
        }





    }
}
