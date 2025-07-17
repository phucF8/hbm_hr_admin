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
                    .ThenInclude(q => q.Options)
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

                // ✅ Lấy danh sách ID các câu hỏi hiện có và mới
                var incomingQuestionIds = dto.Questions.Select(q => q.Id).ToList();
                var toDeleteQuestions = topic.Questions
                    .Where(q => !incomingQuestionIds.Contains(q.Id))
                    .ToList();

                _context.Questions.RemoveRange(toDeleteQuestions);

                foreach (var qDto in dto.Questions)
                {
                    var existingQ = topic.Questions.FirstOrDefault(q => q.Id == qDto.Id);

                    if (existingQ != null)
                    {
                        // ✅ Cập nhật câu hỏi cũ
                        existingQ.Content = qDto.Content;
                        existingQ.Type = qDto.Type;
                        existingQ.OrderNumber = qDto.OrderNumber;
                        existingQ.UpdatedBy = dto.UpdatedBy;
                        existingQ.UpdatedAt = DateTime.UtcNow;

                        // ✅ Xử lý Options của câu hỏi này
                        var incomingOptionIds = qDto.Options.Select(o => o.Id).ToList();
                        var toDeleteOptions = existingQ.Options
                            .Where(o => !incomingOptionIds.Contains(o.Id))
                            .ToList();

                        _context.Options.RemoveRange(toDeleteOptions);

                        foreach (var oDto in qDto.Options)
                        {
                            var existingO = existingQ.Options.FirstOrDefault(o => o.Id == oDto.Id);
                            if (existingO != null)
                            {
                                // Cập nhật option
                                existingO.Content = oDto.Content;
                                existingO.OrderNumber = oDto.OrderNumber;
                                existingO.UpdatedBy = dto.UpdatedBy;
                                existingO.UpdatedAt = DateTime.UtcNow;
                            }
                            else
                            {
                                // Thêm mới option
                                var newOption = new Option
                                {
                                    Id = string.IsNullOrWhiteSpace(oDto.Id) ? Guid.NewGuid().ToString() : oDto.Id,
                                    QuestionId = existingQ.Id,
                                    Content = oDto.Content,
                                    OrderNumber = oDto.OrderNumber,
                                    CreatedBy = dto.UpdatedBy,
                                    CreatedAt = DateTime.UtcNow
                                };
                                existingQ.Options.Add(newOption);
                            }
                        }
                    }
                    else
                    {
                        // ✅ Thêm mới câu hỏi và options
                        var newQ = new Question
                        {
                            Id = qDto.Id,
                            Content = qDto.Content,
                            Type = qDto.Type,
                            OrderNumber = qDto.OrderNumber,
                            TopicId = topic.Id,
                            CreatedBy = dto.UpdatedBy,
                            CreatedAt = DateTime.UtcNow,
                            Options = qDto.Options.Select(o => new Option
                            {
                                Id = string.IsNullOrWhiteSpace(o.Id) ? Guid.NewGuid().ToString() : o.Id,
                                Content = o.Content,
                                OrderNumber = o.OrderNumber,
                                CreatedBy = dto.UpdatedBy,
                                CreatedAt = DateTime.UtcNow
                            }).ToList()
                        };
                        topic.Questions.Add(newQ);
                    }
                }

                await _context.SaveChangesAsync();
                return topic;
            }
            catch (DbUpdateException ex)
            {
                var detail = ex.InnerException?.Message ?? ex.Message;
                throw new Exception("Lỗi khi lưu vào DB: " + detail);
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
