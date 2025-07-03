using HBM_HR_Admin_Angular2.Server.Voting.Models;

namespace HBM_HR_Admin_Angular2.Server.Voting.Repositories
{
    public interface ITopicRepository
    {
        Task<Topic> AddAsync(Topic topic);
    }

}
