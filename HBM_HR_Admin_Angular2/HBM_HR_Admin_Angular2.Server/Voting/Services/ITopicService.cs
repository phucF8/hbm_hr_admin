using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Models;

namespace HBM_HR_Admin_Angular2.Server.Voting.Services
{
    public interface ITopicService
    {
        Task<Topic> CreateAsync(CreateTopicDto dto);
    }


}
