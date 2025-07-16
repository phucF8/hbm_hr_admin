using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Voting.Repositories
{
    public class TopicRepository : ITopicRepository
    {
        private readonly ApplicationDbContext _context;

        public TopicRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Topic> AddAsync(Topic topic)
        {
            _context.Topics.Add(topic);
            await _context.SaveChangesAsync();
            return topic;
        }

        public async Task<PagedResultDto<TopicDto>> GetPagedAsync(int page, int pageSize)
        {
            var query = from t in _context.Topics
                        join created in _context.DbNhanVien on t.CreatedBy equals created.ID into createdGroup
                        from createdUser in createdGroup.DefaultIfEmpty()
                        join updated in _context.DbNhanVien on t.UpdatedBy equals updated.ID into updatedGroup
                        from updatedUser in updatedGroup.DefaultIfEmpty()
                        orderby t.CreatedAt descending
                        select new TopicDto
                        {
                            Id = t.Id,
                            Title = t.Title,
                            Description = t.Description,
                            StartDate = t.StartDate,
                            EndDate = t.EndDate,
                            CreatedByName = createdUser.TenNhanVien,
                            UpdatedByName = updatedUser.TenNhanVien
                        };

            var totalItems = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResultDto<TopicDto>
            {
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                Items = items
            };
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
                return false;
            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Topic?> UpdateAsync(UpdateTopicDto dto)
        {
            var topic = await _context.Topics
                .Include(t => t.Questions)
                .FirstOrDefaultAsync(t => t.Id == dto.Id);

            if (topic == null)
                return null;
            try
            {
                // ✅ Cập nhật thông tin Topic
                topic.Title = dto.Title;
                topic.Description = dto.Description;
                topic.StartDate = dto.StartDate;
                topic.EndDate = dto.EndDate;
                topic.UpdatedBy = dto.UpdatedBy;
                topic.UpdatedAt = DateTime.UtcNow;

                // ✅ Cập nhật danh sách câu hỏi
                var existingQuestionIds = topic.Questions.Select(q => q.Id).ToList();
                var incomingQuestionIds = dto.Questions.Select(q => q.Id).ToList();

                // ✅ Xoá các câu hỏi không còn trong danh sách mới
                var toDelete = topic.Questions.Where(q => !incomingQuestionIds.Contains(q.Id)).ToList();
                _context.Questions.RemoveRange(toDelete);

                foreach (var questionDto in dto.Questions)
                {
                    var existingQuestion = topic.Questions.FirstOrDefault(q => q.Id == questionDto.Id);
                    if (existingQuestion != null)
                    {
                        // ✅ Cập nhật câu hỏi cũ
                        existingQuestion.Content = questionDto.Content;
                        existingQuestion.Type = questionDto.Type;
                        existingQuestion.OrderNumber = questionDto.OrderNumber;
                    }
                    else
                    {
                        // ✅ Thêm mới câu hỏi
                        var newQuestion = new Question
                        {
                            Id = questionDto.Id,
                            Content = questionDto.Content,
                            Type = questionDto.Type,
                            OrderNumber = questionDto.OrderNumber,
                            TopicId = topic.Id,
                            CreatedBy = topic.UpdatedBy,
                        };
                        topic.Questions.Add(newQuestion);
                    }
                }

                await _context.SaveChangesAsync();
                return topic;
            }
            catch (DbUpdateException ex)
            {
                var detailedError = ex.InnerException?.Message ?? ex.Message;
                throw new Exception("Lỗi khi lưu dữ liệu vào DB: " + detailedError);
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi không xác định: " + ex.Message);
            }
        }


        public async Task<TopicDto?> GetByIdAsync(string id)
        {
            var query = from t in _context.Topics
                        where t.Id == id
                        join created in _context.DbNhanVien on t.CreatedBy equals created.ID into createdGroup
                        from createdUser in createdGroup.DefaultIfEmpty()
                        join updated in _context.DbNhanVien on t.UpdatedBy equals updated.ID into updatedGroup
                        from updatedUser in updatedGroup.DefaultIfEmpty()
                        select new TopicDto
                        {
                            Id = t.Id,
                            Title = t.Title,
                            Description = t.Description,
                            StartDate = t.StartDate,
                            EndDate = t.EndDate,
                            CreatedBy = createdUser.ID,
                            UpdatedBy = updatedUser.ID,
                            CreatedByName = createdUser.TenNhanVien,
                            UpdatedByName = updatedUser.TenNhanVien,
                            CreatedAt = t.CreatedAt,
                            UpdatedAt = t.UpdatedAt,
                            Questions = _context.Questions
                                .Where(q => q.TopicId == t.Id)
                                .OrderBy(q => q.OrderNumber)
                                .Select(q => new QuestionDto
                                {
                                    Id = q.Id,
                                    Content = q.Content,
                                    Type = q.Type,
                                    OrderNumber = q.OrderNumber
                                }).ToList()
                        };

            return await query.FirstOrDefaultAsync();
        }



    }

}
