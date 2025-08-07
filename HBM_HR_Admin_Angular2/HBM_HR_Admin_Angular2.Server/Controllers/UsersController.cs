using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SaveUser([FromBody] SaveUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                return BadRequest("Username không được để trống.");

            // Kiểm tra nếu user đã tồn tại
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (existingUser != null)
            {
                return Ok(new { Status = "EXIST", Message = "User đã tồn tại." });
            }

            // Tạo mới
            var user = new User
            {
                Username = request.Username,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { Status = "SUCCESS", Message = "Lưu user thành công." });
        }
    }

}
