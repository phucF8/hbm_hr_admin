using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly EventService _eventService;
        private readonly ILogger<EventController> _logger;

        public EventController(EventService eventService, ILogger<EventController> logger)
        {
            _eventService = eventService;
            _logger = logger;
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveEvent()
        {
            try
            {
                var activeEvent = await _eventService.GetActiveEventAsync();

                if (activeEvent == null)
                {
                    return Ok(ApiResponse<EventPage?>.Success(null, "Không có event nào đang hoạt động"));
                }

                return Ok(ApiResponse<EventPage>.Success(activeEvent, "Lấy event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy active event: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }
    }
}
