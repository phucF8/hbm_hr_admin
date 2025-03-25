using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HBM_HR_Admin_Angular2.Server.Data;
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
    }

}
