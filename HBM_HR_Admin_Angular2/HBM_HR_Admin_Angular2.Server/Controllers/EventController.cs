using HBM_HR_Admin_Angular2.Server.DTOs;
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

        /// <summary>
        /// POST /api/event/active - Lấy event đang active theo thời gian
        /// </summary>
        [HttpPost("active")]
        public async Task<IActionResult> GetActiveEvent()
        {
            try
            {
                var activeEvent = await _eventService.GetActiveEventAsync();

                if (activeEvent == null)
                {
                    return Ok(ApiResponse<EventPage?>.Success(null, "Không có event nào đang hoạt động"));
                }

                // Tạo HTML từ HtmlContent JSON
                var generatedHtml = _eventService.GenerateHtmlFromContent(activeEvent.HtmlContent);

                // Trả về object với thêm trường GeneratedHtml
                var response = new
                {
                    activeEvent.Id,
                    activeEvent.Title,
                    activeEvent.HtmlContent,
                    activeEvent.IsActive,
                    activeEvent.Version,
                    activeEvent.StartTime,
                    activeEvent.EndTime,
                    activeEvent.Priority,
                    GeneratedHtml = generatedHtml
                };

                return Ok(ApiResponse<object>.Success(response, "Lấy event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy active event: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/event/GetAll - Lấy tất cả events
        /// </summary>
        [HttpPost("GetAll")]
        public async Task<IActionResult> GetAllEvents()
        {
            try
            {
                var events = await _eventService.GetAllEventsAsync();
                
                // Tạo HTML cho mỗi event
                var eventsWithHtml = events.Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.HtmlContent,
                    e.IsActive,
                    e.Version,
                    e.StartTime,
                    e.EndTime,
                    e.Priority,
                    GeneratedHtml = _eventService.GenerateHtmlFromContent(e.HtmlContent)
                }).ToList();

                return Ok(ApiResponse<object>.Success(eventsWithHtml, "Lấy danh sách event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy danh sách events: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/event/GetById - Lấy event theo ID
        /// </summary>
        [HttpPost("GetById")]
        public async Task<IActionResult> GetEventById([FromBody] GetEventByIdRequest request)
        {
            try
            {
                var eventPage = await _eventService.GetEventByIdAsync(request.Id);

                if (eventPage == null)
                {
                    return NotFound(ApiResponse<string>.Error($"Không tìm thấy event với ID: {request.Id}"));
                }

                // Tạo HTML từ HtmlContent JSON
                var generatedHtml = _eventService.GenerateHtmlFromContent(eventPage.HtmlContent);

                // Trả về object với thêm trường GeneratedHtml
                var response = new
                {
                    eventPage.Id,
                    eventPage.Title,
                    eventPage.HtmlContent,
                    eventPage.IsActive,
                    eventPage.Version,
                    eventPage.StartTime,
                    eventPage.EndTime,
                    eventPage.Priority,
                    GeneratedHtml = generatedHtml
                };

                return Ok(ApiResponse<object>.Success(response, "Lấy event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lấy event {request.Id}: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/event/create - Tạo event mới
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventPageRequest request)
        {
            try
            {
                // Validate EndTime > StartTime (nếu có EndTime)
                if (request.EndTime.HasValue && request.EndTime <= request.StartTime)
                {
                    return BadRequest(ApiResponse<string>.Error("EndTime phải lớn hơn StartTime"));
                }

                var eventPage = new EventPage
                {
                    Title = request.Title,
                    HtmlContent = request.HtmlContent,
                    IsActive = request.IsActive,
                    Version = request.Version,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Priority = request.Priority
                };

                var createdEvent = await _eventService.CreateEventAsync(eventPage);

                // Tạo HTML từ HtmlContent JSON
                var generatedHtml = _eventService.GenerateHtmlFromContent(createdEvent.HtmlContent);

                // Trả về object với thêm trường GeneratedHtml
                var response = new
                {
                    createdEvent.Id,
                    createdEvent.Title,
                    createdEvent.HtmlContent,
                    createdEvent.IsActive,
                    createdEvent.Version,
                    createdEvent.StartTime,
                    createdEvent.EndTime,
                    createdEvent.Priority,
                    GeneratedHtml = generatedHtml
                };

                return Ok(ApiResponse<object>.Success(response, "Tạo event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo event: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/event/update - Cập nhật event
        /// </summary>
        [HttpPost("update")]
        public async Task<IActionResult> UpdateEvent([FromBody] UpdateEventPageRequest request)
        {
            try
            {
                // Validate EndTime > StartTime (nếu có EndTime)
                if (request.EndTime.HasValue && request.EndTime <= request.StartTime)
                {
                    return BadRequest(ApiResponse<string>.Error("EndTime phải lớn hơn StartTime"));
                }

                var eventPage = new EventPage
                {
                    Title = request.Title,
                    HtmlContent = request.HtmlContent,
                    IsActive = request.IsActive,
                    Version = request.Version,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Priority = request.Priority
                };

                var updatedEvent = await _eventService.UpdateEventAsync(request.Id, eventPage);

                if (updatedEvent == null)
                {
                    return NotFound(ApiResponse<string>.Error($"Không tìm thấy event với ID: {request.Id}"));
                }

                // Tạo HTML từ HtmlContent JSON
                var generatedHtml = _eventService.GenerateHtmlFromContent(updatedEvent.HtmlContent);

                // Trả về object với thêm trường GeneratedHtml
                var response = new
                {
                    updatedEvent.Id,
                    updatedEvent.Title,
                    updatedEvent.HtmlContent,
                    updatedEvent.IsActive,
                    updatedEvent.Version,
                    updatedEvent.StartTime,
                    updatedEvent.EndTime,
                    updatedEvent.Priority,
                    GeneratedHtml = generatedHtml
                };

                return Ok(ApiResponse<object>.Success(response, "Cập nhật event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi cập nhật event {request.Id}: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/event/delete - Xóa event
        /// </summary>
        [HttpPost("delete")]
        public async Task<IActionResult> DeleteEvent([FromBody] DeleteEventRequest request)
        {
            try
            {
                var success = await _eventService.DeleteEventAsync(request.Id);

                if (!success)
                {
                    return NotFound(ApiResponse<string>.Error($"Không tìm thấy event với ID: {request.Id}"));
                }

                return Ok(ApiResponse<string>.Success(null, "Xóa event thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xóa event {request.Id}: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/event/toggle - Toggle trạng thái IsActive
        /// </summary>
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleActiveStatus([FromBody] ToggleEventRequest request)
        {
            try
            {
                var updatedEvent = await _eventService.ToggleActiveStatusAsync(request.Id);

                if (updatedEvent == null)
                {
                    return NotFound(ApiResponse<string>.Error($"Không tìm thấy event với ID: {request.Id}"));
                }

                // Tạo HTML từ HtmlContent JSON
                var generatedHtml = _eventService.GenerateHtmlFromContent(updatedEvent.HtmlContent);

                // Trả về object với thêm trường GeneratedHtml
                var response = new
                {
                    updatedEvent.Id,
                    updatedEvent.Title,
                    updatedEvent.HtmlContent,
                    updatedEvent.IsActive,
                    updatedEvent.Version,
                    updatedEvent.StartTime,
                    updatedEvent.EndTime,
                    updatedEvent.Priority,
                    GeneratedHtml = generatedHtml
                };

                return Ok(ApiResponse<object>.Success(response, 
                    $"Toggle IsActive thành công. Trạng thái hiện tại: {updatedEvent.IsActive}"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi toggle IsActive cho event {request.Id}: {ex.Message}");
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }
    }
}
