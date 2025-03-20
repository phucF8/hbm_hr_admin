using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HBM_HR_Admin_Angular2.Server.Data;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [Route("api/thongbao")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        // private readonly ApplicationDbContext _context;
        private readonly NotificationRepository _repository;

        public ThongBaoController(NotificationRepository repository)
        {
            // _context = context;
            _repository = repository;
        }

        // API GET /api/thongbao - Lấy danh sách thông báo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var notifications = await _repository.GetNotificationsWithPaging(pageIndex, pageSize);
            return Ok(notifications);
        }
    }

}
