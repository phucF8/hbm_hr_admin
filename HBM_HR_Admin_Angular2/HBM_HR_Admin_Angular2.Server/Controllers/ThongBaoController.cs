using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HBM_HR_Admin_Angular2.Server.Data;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [Route("api/thongbao")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ThongBaoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // API GET /api/thongbao - Lấy danh sách thông báo
        [HttpGet]
        public async Task<IActionResult> GetThongBao()
        {
            var notifications = await _context.NS_ADTB_Notifications
                                              .OrderByDescending(n => n.NgayTao)
                                              .ToListAsync();
            return Ok(notifications);
        }
    }

}
