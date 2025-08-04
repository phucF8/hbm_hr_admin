using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using HBM_HR_Admin_Angular2.Server.Voting.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Voting.Services
{
    public class TopicService : ITopicService
    {
        private readonly ITopicRepository _repository;

        public TopicService(ITopicRepository repository)
        {
            _repository = repository;
        }

        public async Task<Topic> CreateAsync(CreateTopicDto dto)
        {
            var topic = new Topic
            {
                Id = Guid.NewGuid().ToString(),
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedBy = dto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                Questions = dto.Questions?.Select(qDto => new Question
                {
                    Id = string.IsNullOrWhiteSpace(qDto.Id) ? Guid.NewGuid().ToString() : qDto.Id,
                    Content = qDto.Content,
                    Type = qDto.Type,
                    OrderNumber = qDto.OrderNumber,
                    TopicId = "", // Sẽ gán lại sau
                    CreatedBy = dto.CreatedBy,
                    CreatedAt = DateTime.UtcNow,
                    Options = qDto.Options?.Select(oDto => new Option
                    {
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
            if (topic.Questions != null)
            {
                foreach (var question in topic.Questions)
                {
                    question.TopicId = topic.Id;

                    if (question.Options != null)
                    {
                        foreach (var option in question.Options)
                        {
                            option.QuestionId = question.Id;
                        }
                    }
                }
            }

            return await _repository.AddAsync(topic);
        }


        public async Task<PagedResultDto<TopicDto>> GetPagedTopicsAsync(int page, int pageSize)
        {
            return await _repository.GetPagedAsync(page, pageSize);
        }

        public async Task<bool> DeleteTopicAsync(string id)
        {
            return await _repository.DeleteAsync(id);
        }
        public async Task<Topic?> UpdateTopicAsync(UpdateTopicDto dto)
        {
            return await _repository.UpdateAsync(dto);
        }

        public async Task<TopicDto?> GetTopicByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

    }


}
