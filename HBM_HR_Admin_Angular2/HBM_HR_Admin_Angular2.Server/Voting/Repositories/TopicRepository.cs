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
            var query = _context.Topics.OrderByDescending(t => t.CreatedAt);
            var totalItems = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TopicDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate
                })
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
            var topic = await _context.Topics.FindAsync(dto.Id);
            if (topic == null)
                return null;

            topic.Title = dto.Title;
            topic.Description = dto.Description;
            topic.StartDate = dto.StartDate;
            topic.EndDate = dto.EndDate;
            topic.UpdatedBy = dto.UpdatedBy;
            topic.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return topic;
        }

        public async Task<Topic?> GetByIdAsync(string id)
        {
            return await _context.Topics.FirstOrDefaultAsync(t => t.Id == id);
        }

    }

}
