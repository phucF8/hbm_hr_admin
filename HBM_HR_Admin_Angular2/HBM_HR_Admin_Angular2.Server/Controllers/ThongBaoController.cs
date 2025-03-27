using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.Extensions.Logging;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [Route("api/thongbao")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        // private readonly ApplicationDbContext _context;
        private readonly NotificationRepository _repository;
        private readonly ILogger<ThongBaoController> _logger;

        public ThongBaoController(NotificationRepository repository, ILogger<ThongBaoController> logger)
        {
            // _context = context;
            _repository = repository;
            _logger = logger;
        }

        // API GET /api/thongbao - Lấy danh sách thông báo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications(
            [FromQuery] int pageIndex = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] int notificationType = 0)
        {
            _logger.LogInformation($"Received request with notificationType: {notificationType}");
            var notifications = await _repository.GetNotificationsWithPaging(pageIndex, pageSize, notificationType);
            _logger.LogInformation($"Returning {notifications.Count()} notifications");
            return Ok(notifications);
        }

        // API POST /api/thongbao - Tạo thông báo mới
        [HttpPost]
        public async Task<ActionResult<Notification>> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                _logger.LogInformation($"Creating new notification: {request.Title}");
                
                // Validate request
                if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Content))
                {
                    return BadRequest("Tiêu đề và nội dung không được để trống");
                }

                if (request.Title.Length < 3)
                {
                    return BadRequest("Tiêu đề phải có ít nhất 3 ký tự");
                }

                if (request.Content.Length < 10)
                {
                    return BadRequest("Nội dung phải có ít nhất 10 ký tự");
                }

                // Create new notification
                var notification = new Notification
                {
                    Title = request.Title,
                    Content = request.Content,
                    NotificationType = request.NotificationType,
                    SentAt = request.SentAt,
                    SenderId = request.SenderId,
                };

                // Save to database using stored procedure
                var result = await _repository.CreateNotification(notification);
                
                _logger.LogInformation($"Successfully created notification with ID: {result.ID}");
                return CreatedAtAction(nameof(GetNotifications), new { id = result.ID }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return StatusCode(500, "Đã xảy ra lỗi khi tạo thông báo");
            }
        }

        // API DELETE /api/thongbao/{id} - Xóa thông báo
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            try
            {
                _logger.LogInformation($"Deleting notification with ID: {id}");
                await _repository.DeleteNotification(id);
                _logger.LogInformation($"Successfully deleted notification with ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return StatusCode(500, "Đã xảy ra lỗi khi xóa thông báo");
            }
        }

        // API DELETE /api/thongbao/batch - Xóa nhiều thông báo
        [HttpDelete("multi")]
        public async Task<IActionResult> DeleteMultipleNotifications([FromBody] string[] ids)
        {
            try
            {
                _logger.LogInformation($"Deleting multiple notifications: {string.Join(", ", ids)}");
                await _repository.DeleteMultiNotification(string.Join(",", ids));
                _logger.LogInformation($"Successfully deleted {ids.Length} notifications");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting multiple notifications");
                return StatusCode(500, "Đã xảy ra lỗi khi xóa thông báo");
            }
        }

        // API PUT /api/thongbao/{id} - Cập nhật thông báo
        [HttpPut("{id}")]
        public async Task<ActionResult<Notification>> UpdateNotification(string id, [FromBody] UpdateNotificationRequest request)
        {
            try
            {
                _logger.LogInformation($"Updating notification with ID: {id}");
                
                // Validate request
                if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Content))
                {
                    return BadRequest("Tiêu đề và nội dung không được để trống");
                }

                if (request.Title.Length < 3)
                {
                    return BadRequest("Tiêu đề phải có ít nhất 3 ký tự");
                }

                if (request.Content.Length < 10)
                {
                    return BadRequest("Nội dung phải có ít nhất 10 ký tự");
                }

                var notification = new Notification
                {
                    ID = id,
                    Title = request.Title,
                    Content = request.Content,
                    NotificationType = request.NotificationType,
                    SentAt = request.SentAt
                };

                var result = await _repository.UpdateNotification(notification);
                
                if (result == null)
                {
                    return NotFound($"Không tìm thấy thông báo với ID: {id}");
                }

                _logger.LogInformation($"Successfully updated notification with ID: {id}");
                _logger.LogInformation($"Successfully updated notification with ID: {request.SentAt}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification");
                return StatusCode(500, "Đã xảy ra lỗi khi cập nhật thông báo");
            }
        }
    }

    public class CreateNotificationRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public int NotificationType { get; set; }
        public string SenderId { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class UpdateNotificationRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public int NotificationType { get; set; }
        public DateTime? SentAt { get; set; }
        
    }
}
