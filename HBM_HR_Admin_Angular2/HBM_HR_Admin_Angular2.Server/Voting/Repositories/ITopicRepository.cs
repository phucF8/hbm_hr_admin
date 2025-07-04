using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;

namespace HBM_HR_Admin_Angular2.Server.Voting.Repositories
{
    public interface ITopicRepository
    {
        Task<Topic> AddAsync(Topic topic);
        Task<PagedResultDto<TopicDto>> GetPagedAsync(int page, int pageSize);
        Task<bool> DeleteAsync(string id);
        Task<Topic?> UpdateAsync(UpdateTopicDto dto);
        Task<Topic?> GetByIdAsync(string id);

    }

}
