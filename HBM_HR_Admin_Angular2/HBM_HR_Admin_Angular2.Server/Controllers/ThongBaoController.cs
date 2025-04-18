using Microsoft.AspNetCore.Mvc;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Helpers;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [Route("api/thongbao")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        private readonly FirebaseNotificationService _firebaseService;
        private readonly NotificationRepository _repository;
        private readonly ILogger<ThongBaoController> _logger;

        public ThongBaoController(FirebaseNotificationService firebaseService, NotificationRepository repository, ILogger<ThongBaoController> logger)
        {
            _firebaseService = firebaseService;
            _repository = repository;
            _logger = logger;
        }

        // API GET /api/thongbao - Lấy danh sách thông báo
        [HttpGet]
        public async Task<ActionResult<PagedResult<Notification>>> GetNotifications(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = AppSettings.DefaultPageSize, // Use the constant here
            [FromQuery] int notificationType = 0)
        {
            _logger.LogInformation($"Received request with notificationType: {notificationType}");
            var notifications = await _repository.GetNotificationsWithPaging(pageIndex, pageSize, notificationType);
            _logger.LogInformation($"Returning {notifications.Items.Count} notifications, TotalCount: {notifications.TotalCount}");
            return Ok(notifications);
        }


        // API GET /api/thongbao/{id} - Lấy 1 danh sách thông báo củ thể
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(string id)
        {
            _logger.LogInformation($"GetNotification: {id}");
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Notification ID is empty");
                return BadRequest("Notification ID cannot be empty");
            }
            var notification = await _repository.GetNotificationByID(id);
            if (notification == null)
            {
                _logger.LogWarning($"Notification with ID {id} not found");
                return NotFound($"Notification with ID {id} not found");
            }
            var result = await _repository.SelectNotificationRecipients(id);
            notification.Recipients = result.ToList();
            _logger.LogInformation($"Returning notification ID: {notification.ID}, Title: {notification.Title}, Recipients count: {result.Count()}");
            return Ok(notification);
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
                    ID = request.ID,
                    Title = request.Title,
                    Content = request.Content,
                    NotificationType = request.NotificationType,
                    SentAt = request.SentAt,
                    SenderId = request.SenderId,
                };

                // Save notification to database
                var result = await _repository.CreateNotification(notification);
                _logger.LogInformation($"Successfully created notification with ID: {result}");

                // Insert recipients
                if (request.Recipients != null && request.Recipients.Any())
                {
                    foreach (var recipientId in request.Recipients)
                    {
                        _logger.LogInformation($"InsertNotificationRecipient {request.ID}, {recipientId}, {request.SenderId}");
                        await _repository.InsertNotificationRecipient(result.ID, recipientId, request.SenderId);
                    }
                }

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
                await _repository.DeleteNotificationRecipients_Multi(ids);
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
                else
                {
                    // Delete recipients
                    await _repository.DeleteNotificationRecipients(notification.ID);
                    // Insert recipients
                    if (request.Recipients != null && request.Recipients.Any())
                    {
                        foreach (var recipientId in request.Recipients)
                        {
                            _logger.LogInformation($"InsertNotificationRecipient {result.ID}, {recipientId}, {"SYS"}");
                            await _repository.InsertNotificationRecipient(result.ID, recipientId, "SYS");
                        }
                    }
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



        // API POST /api/thongbao/send - Gửi thông báo thử nghiệm
        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] TestSendNotificationRequest request)
        {
            int successCount = 0;
            int totalCount = 0;
            var userStats = new Dictionary<string, (int success, int total)>(); // Lưu thống kê theo user
            if (request == null || string.IsNullOrWhiteSpace(request.IDNhanViens))
            {
                return BadRequest("ID nhân viên là bắt buộc");
            }
            foreach (var id in request.IDNhanViens.Split(','))
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return BadRequest("ID nhân viên không hợp lệ");
                }
                var deviceTokens = await _repository.GetDeviceTokenByEmployeeId(id);
                if (deviceTokens == null || !deviceTokens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy token cho nhân viên {id}");
                    continue; // Không xử lý nếu không có token
                }
                int userSuccessCount = 0;
                int userTotalCount = deviceTokens.Count();
                var tokens = deviceTokens.Select(dt => dt.DeviceToken).ToList();
                var result = await _firebaseService.SendNotificationAsync(
                    tokens,
                    request.Title,
                    request.Body,
                    request.Data);
                if (result)
                {
                    userSuccessCount = userTotalCount;
                }
                userStats[id] = (userSuccessCount, userTotalCount);
                successCount += userSuccessCount;
                totalCount += userTotalCount;
            }
            var summary = userStats.Select(userStat => new
            {
                UserId = userStat.Key,
                Success = userStat.Value.success,
                TotalTokens = userStat.Value.total,
                Status = userStat.Value.success > 0 ? "Success" : "Fail"
            });
            await _repository.UpdateNotificationStatus(request.NotificationID);
            return Ok(new
            {
                Message = "Notification sent done",
                SuccessCount = successCount,
                TotalCount = totalCount,
                SuccessRate = totalCount > 0 ? (double)successCount / totalCount * 100 : 0,
                UserStats = summary
            });
        }

        // API POST /api/thongbao/sendone - Gửi thông báo thử nghiệm (phiên bản 0)
        [HttpPost("sendone")]
        public async Task<IActionResult> SendNotificationOne([FromBody] TestSendNotificationRequest request)
        {
            int successCount = 0;
            int totalCount = 0;
            var userStats = new Dictionary<string, (int success, int total)>(); // Lưu thống kê theo user

            // Validate request
            if (request == null || string.IsNullOrWhiteSpace(request.IDNhanViens))
            {
                return BadRequest("ID nhân viên là bắt buộc");
            }

            foreach (var id in request.IDNhanViens.Split(','))
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return BadRequest("ID nhân viên không hợp lệ");
                }

                // Lấy token từ database
                var deviceTokens = await _repository.GetDeviceTokenByEmployeeId(id);
                if (deviceTokens == null || !deviceTokens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy token cho nhân viên {id}");
                    continue; // Không xử lý nếu không có token
                }

                int userSuccessCount = 0;
                int userTotalCount = deviceTokens.Count();

                // Gửi thông báo đến tất cả các token
                foreach (var deviceToken in deviceTokens)
                {
                    var result = await _firebaseService.SendNotificationAsync(
                        deviceToken.DeviceToken,
                        request.Title, request.Body,
                        request.Data);

                    if (result)
                    {
                        userSuccessCount++;
                    }
                }
                // Lưu thống kê cho user
                userStats[id] = (userSuccessCount, userTotalCount);
                // Cập nhật tổng số thành công và tổng số token
                successCount += userSuccessCount;
                totalCount += userTotalCount;
            }

            // Tính tổng kết thành công và thất bại cho các user
            var summary = userStats.Select(userStat => new
            {
                UserId = userStat.Key,
                Success = userStat.Value.success,
                TotalTokens = userStat.Value.total,
                Status = userStat.Value.success > 0 ? "Success" : "Fail"
            });

            return Ok(new
            {
                Message = "Notification sent done",
                SuccessCount = successCount,
                TotalCount = totalCount,
                SuccessRate = totalCount > 0 ? (double)successCount / totalCount * 100 : 0,
                UserStats = summary
            });
        }










        // API POST /api/thongbao/test - Gửi thông báo thử nghiệm (phiên bản 0)
        [HttpPost("test")]
        public async Task<IActionResult> TestNotification([FromBody] TestNotificationRequest request)
        {
            var userStats = new Dictionary<string, (int success, int total)>(); // Lưu thống kê theo user
            {
                String IDNhanVien = request.IDNhanVien;
                if (string.IsNullOrWhiteSpace(IDNhanVien))
                {
                    return BadRequest("ID nhân viên không hợp lệ");
                }
                // Lấy token từ database
                var deviceTokens = await _repository.GetDeviceTokenByEmployeeId(IDNhanVien);
                if (deviceTokens == null || !deviceTokens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy token cho nhân viên {IDNhanVien}");

                }
                foreach (var deviceToken in deviceTokens)
                {
                    var result = await _firebaseService.TestNotificationAsync( 
                        deviceToken.DeviceToken,
                        request.Title,
                        request.Body,
                        request.Badge
                        );
                    if (result)
                    {
                    }
                }
            }
            // Tính tổng kết thành công và thất bại cho các user
            var summary = userStats.Select(userStat => new
            {
                UserId = userStat.Key,
                Success = userStat.Value.success,
                TotalTokens = userStat.Value.total,
                Status = userStat.Value.success > 0 ? "Success" : "Fail"
            });
            return Ok(new
            {
                Message = "Notification sent done",
                UserStats = summary
            });
        }
    }


}

public class CreateNotificationRequest
{
    public string ID { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public int NotificationType { get; set; }
    public string SenderId { get; set; }
    public DateTime? SentAt { get; set; }
    public List<string> Recipients { get; set; } // Danh sách ID người nhận
}

public class UpdateNotificationRequest
{
    public string Title { get; set; }
    public string Content { get; set; }
    public int NotificationType { get; set; }
    public DateTime? SentAt { get; set; }
    public List<string> Recipients { get; set; } // Danh sách ID người nhận

}

public class TestSendNotificationRequest
{
    public string NotificationID { get; set; } // ID thông báo
    public string IDNhanViens { get; set; } // Chuỗi các ID nhân viên cách nhau bằng dấu ','
    public string Title { get; set; }
    public string Body { get; set; }
    public Dictionary<string, string> Data { get; set; } // Dữ liệu bổ sung nếu cần
}

public class TestNotificationRequest
{
    public string IDNhanVien { get; set; } // Chuỗi các ID nhân viên cách nhau bằng dấu ','
    public string Title { get; set; }
    public string Body { get; set; }
    public Dictionary<string, string> Data { get; set; } // Dữ liệu bổ sung nếu cần
     public int Badge { get; set; }
}


