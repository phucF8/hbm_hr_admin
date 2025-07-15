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
                        };

            return await query.FirstOrDefaultAsync();
        }


    }

}
