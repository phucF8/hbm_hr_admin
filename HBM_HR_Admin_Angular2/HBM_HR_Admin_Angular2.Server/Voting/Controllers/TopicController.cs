using HBM_HR_Admin_Angular2.Server.Voting.DTOs;
using HBM_HR_Admin_Angular2.Server.Voting.Services;
using Microsoft.AspNetCore.Mvc;

namespace HBM_HR_Admin_Angular2.Server.Voting.controllers
{
    [ApiController]
    [Route("api/topics")]
    public class TopicController : ControllerBase
    {
        private readonly ITopicService _service;

        public TopicController(ITopicService service)
        {
            _service = service;
        }



        [HttpPost("create")]
        public async Task<IActionResult> CreateTopic([FromBody] CreateTopicDto dto)
        {
            var topic = await _service.CreateAsync(dto);
            return Ok(topic);
        }
    }


}
