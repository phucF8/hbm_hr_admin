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
                CreatedAt = DateTime.UtcNow
            };

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



    }


}
