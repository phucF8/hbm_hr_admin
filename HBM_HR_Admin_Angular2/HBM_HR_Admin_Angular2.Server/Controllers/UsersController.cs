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


        [HttpPost("GetAllUsers")]
        public ActionResult<IEnumerable<UserDto>> GetAllUsers() {
            var users = _context.Users
                .Select(u => new UserDto {
                    Id = u.Id,
                    Username = u.Username,
                    FullName = u.FullName,
                    AvatarUrl = u.AvatarUrl,
                    LastAccessAt = u.LastAccessAt,
                    Permissions = _context.UserPermissions
                        .Where(up => up.UserId == u.Id)
                        .Join(_context.Permissions,
                                up => up.PermissionId,
                                p => p.Id,
                                (up, p) => new PermissionDto {
                                    PermissionId = p.Id,
                                    PermissionName = p.Name
                                })
                        .ToList()
                })
                .ToList();

            return Ok(users);
        }


        //[HttpPost("assign")]
        //public IActionResult AssignPermissions([FromBody] AssignPermissionsDto request)
        //{
        //    if (request.UserId == Guid.Empty || request.PermissionIds == null || !request.PermissionIds.Any())
        //    {
        //        return BadRequest("UserId và danh sách quyền là bắt buộc.");
        //    }

        //    // Xóa quyền cũ trước khi gán mới
        //    var oldPermissions = _context.UserPermissions.Where(up => up.UserId == request.UserId);

        //    _context.UserPermissions.RemoveRange(oldPermissions);

        //    // Gán quyền mới
        //    var newPermissions = request.PermissionIds.Select(pid => new UserPermission
        //    {
        //        UserId = request.UserId,
        //        PermissionId = pid,
        //        AssignedAt = DateTime.Now
        //    });

        //    _context.UserPermissions.AddRange(newPermissions);
        //    _context.SaveChanges();

        //    return Ok(new { Message = "Gán quyền thành công." });
        //}
    }



}
