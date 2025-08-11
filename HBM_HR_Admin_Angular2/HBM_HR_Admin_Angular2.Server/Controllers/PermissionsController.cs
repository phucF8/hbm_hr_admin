using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PermissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetPermissions()
        {
            var permissions = _context.Permissions.ToList();

            var result = permissions.Select(p => new
            {
                p.Id,
                p.Code,
                p.Name
            });

            return Ok(result);
        }

        // Lấy quyền hiện tại của 1 user
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPermissions(Guid userId)
        {
            var permissions = await _context.UserPermissions
                .Where(up => up.UserId == userId)
                .Select(up => up.PermissionId)
                .ToListAsync();

            return Ok(permissions);
        }

        // Cập nhật quyền cho user
        [HttpPost("assign")]
        public async Task<IActionResult> AssignPermissions(UserPermissionDto dto)
        {
            // Xóa quyền cũ của user
            var existing = _context.UserPermissions.Where(up => up.UserId == dto.UserId);
            _context.UserPermissions.RemoveRange(existing);

            // Thêm quyền mới
            var newPermissions = dto.PermissionIds.Select(pid => new UserPermission
            {
                UserId = dto.UserId,
                PermissionId = pid,
                AssignedAt = DateTime.Now
            });

            await _context.UserPermissions.AddRangeAsync(newPermissions);
            await _context.SaveChangesAsync();

            return Ok(new { status = "SUCCESS", message = "Cập nhật quyền thành công" });
        }
    }


}
