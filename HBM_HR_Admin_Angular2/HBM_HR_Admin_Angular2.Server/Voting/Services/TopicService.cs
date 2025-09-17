using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.DTOs;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using HBM_HR_Admin_Angular2.Server.Voting.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Voting.Services {
    public class TopicService {
        private readonly TopicRepository _repository;
        private readonly ApplicationDbContext _context;

        public TopicService(TopicRepository repository, ApplicationDbContext context) {
            _repository = repository;
            _context = context;
        }

        public async Task<Topic> CreateAsync(CreateTopicDto dto) {
            var topic = new Topic {
                Id = Guid.NewGuid().ToString(),
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedBy = dto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                Questions = dto.Questions?.Select(qDto => new Question {
                    Id = string.IsNullOrWhiteSpace(qDto.Id) ? Guid.NewGuid().ToString() : qDto.Id,
                    Content = qDto.Content,
                    Type = qDto.Type,
                    OrderNumber = qDto.OrderNumber,
                    TopicId = "", // Sẽ gán lại sau
                    CreatedBy = dto.CreatedBy,
                    CreatedAt = DateTime.UtcNow,
                    Options = qDto.Options?.Select(oDto => new Option {
                        Id = string.IsNullOrWhiteSpace(oDto.Id) ? Guid.NewGuid().ToString() : oDto.Id,
                        Content = oDto.Content,
                        OrderNumber = oDto.OrderNumber,
                        CreatedBy = dto.CreatedBy,
                        CreatedAt = DateTime.UtcNow,
                        QuestionId = "" // Sẽ gán lại sau
                    }).ToList()
                }).ToList()
            };

            // Cập nhật TopicId cho các câu hỏi, và QuestionId cho các options (sau khi đã có topic.Id)
            if (topic.Questions != null) {
                foreach (var question in topic.Questions) {
                    question.TopicId = topic.Id;

                    if (question.Options != null) {
                        foreach (var option in question.Options) {
                            option.QuestionId = question.Id;
                        }
                    }
                }
            }

            return await _repository.AddAsync(topic);
        }


        public async Task<PagedResultDto<TopicDto>> GetPagedTopicsAsync(int page, int pageSize) {
            return await _repository.GetPagedAsync(page, pageSize);
        }

        public async Task<bool> DeleteTopicAsync(string id) {
            return await _repository.DeleteAsync(id);
        }
        public async Task<Topic?> UpdateTopicAsync(UpdateTopicDto dto) {
            return await _repository.UpdateAsync(dto);
        }

        public async Task<TopicDto?> GetTopicByIdAsync(string id) {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<TopicDto?> GetTopicForReviewByIdAsync(string id, string userId) {
            var query = from t in _context.Topics
                        where t.Id == id
                        join created in _context.DbNhanVien on t.CreatedBy equals created.ID into createdGroup
                        from createdUser in createdGroup.DefaultIfEmpty()
                        join updated in _context.DbNhanVien on t.UpdatedBy equals updated.ID into updatedGroup
                        from updatedUser in updatedGroup.DefaultIfEmpty()
                        select new TopicDto {
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
                                .Select(q => new QuestionDto {
                                    Id = q.Id,
                                    Content = q.Content,
                                    Type = q.Type,
                                    OrderNumber = q.OrderNumber,
                                    Options = _context.Options
                                        .Where(o => o.QuestionId == q.Id)
                                        .OrderBy(o => o.OrderNumber)
                                        .Select(o => new OptionDto {
                                            Id = o.Id,
                                            Content = o.Content,
                                            OrderNumber = o.OrderNumber
                                        }).ToList(),
                                    // Thêm câu trả lời của user (nếu có)
                                    UserAnswers = _context.BB_UserAnswers
                                        .Where(a => a.QuestionId == q.Id && a.UserId == userId)
                                        .Select(a => new UserAnswerDto {
                                            OptionId = a.OptionId,
                                            EssayAnswer = a.EssayAnswer
                                        })
                                        .ToList()

                                }).ToList()
                        };

            return await query.FirstOrDefaultAsync();
        }

        public async Task<TopicDto?> GetTopicDetailReportByIdAsync(string id) {
            var query = from t in _context.Topics
                        where t.Id == id
                        join created in _context.DbNhanVien on t.CreatedBy equals created.ID into createdGroup
                        from createdUser in createdGroup.DefaultIfEmpty()
                        join updated in _context.DbNhanVien on t.UpdatedBy equals updated.ID into updatedGroup
                        from updatedUser in updatedGroup.DefaultIfEmpty()
                        select new TopicDto {
                            Id = t.Id,
                            Title = t.Title,
                            Description = t.Description,
                            StartDate = t.StartDate,
                            EndDate = t.EndDate,
                            CreatedBy = createdUser.ID,
                            UpdatedBy = updatedUser.ID,
                            CreatedByName = createdUser.Username,
                            UpdatedByName = updatedUser.Username,
                            CreatedAt = t.CreatedAt,
                            UpdatedAt = t.UpdatedAt,
                            // Tổng số user đã tham gia trả lời phiếu điều tra
                            TotalParticipants = _context.BB_UserAnswers 
                            .Where(a => a.TopicId == t.Id)
                            .Select(a => a.UserId)
                            .Distinct()
                            .Count(),

                            Questions = _context.Questions
                                .Where(q => q.TopicId == t.Id)
                                .OrderBy(q => q.OrderNumber)
                                .Select(q => new QuestionDto {
                                    Id = q.Id,
                                    Content = q.Content,
                                    Type = q.Type,
                                    OrderNumber = q.OrderNumber,
                                    Options = _context.Options
                                        .Where(o => o.QuestionId == q.Id)
                                        .OrderBy(o => o.OrderNumber)
                                        .Select(o => new OptionDto {
                                            Id = o.Id,
                                            Content = o.Content,
                                            OrderNumber = o.OrderNumber,
                                            // Thống kê số người đã chọn option này
                                            SelectedCount = _context.BB_UserAnswers
                                                .Count(a => a.OptionId == o.Id)
                                        }).ToList(),
                                    // Danh sách câu trả lời tự luận (nếu có)
                                    EssayAnswers = (from a in _context.BB_UserAnswers
                                        join nv in _context.DbNhanVien
                                            on a.UserId equals nv.UserID into gj
                                        from nv in gj.DefaultIfEmpty() // LEFT JOIN
                                        where a.QuestionId == q.Id && !string.IsNullOrEmpty(a.EssayAnswer)
                                        select new EssayAnswerDto {
                                            UserId = a.UserId,
                                            Username = nv.Username,      // lấy Username
                                            FullName = nv.TenNhanVien,   // hoặc lấy tên nhân viên
                                            EssayAnswer = a.EssayAnswer,
                                            CreatedAt = a.CreatedAt
                                        }).ToList(),

                                }).ToList()
                        };

            return await query.FirstOrDefaultAsync();
        }

        public async Task<BB_TopicRelease> SettingReleaseAsync(TopicReleaseRequest request) {
            var release = new BB_TopicRelease {
                Id = Guid.NewGuid().ToString(),
                TopicId = request.TopicId,
                TargetType = request.TargetType,
                TargetId = request.TargetId,
                ReleasedBy = request.ReleasedBy,
                Note = request.Note,
                CreatedAt = DateTime.Now
            };

            _context.BB_TopicRelease.Add(release);
            await _context.SaveChangesAsync();

            return release;
        }


    }


}
