namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    using Azure.Core;
    using HBM_HR_Admin_Angular2.Server.constance;
    using HBM_HR_Admin_Angular2.Server.Data;
    using HBM_HR_Admin_Angular2.Server.Models;
    using HBM_HR_Admin_Angular2.Server.Services;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;
    using System.Collections.Generic;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using System.Threading.Tasks;

    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        private readonly HrAuthService _hrAuthService;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context,JwtTokenGenerator jwtTokenGenerator, HrAuthService hrAuthService, IConfiguration config)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _hrAuthService = hrAuthService;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request) {
            var hrResult = await _hrAuthService.AuthenticateAsync(request.Username, request.Password);

            // Nếu login HR thất bại
            if (hrResult == null || hrResult.Status != "SUCCESS") {
                return Unauthorized(new { message = hrResult?.Message ?? "Tên đăng nhập hoặc mật khẩu không hợp lệ" });
            }

            var nhanVien = hrResult.DataSets?.Table?.FirstOrDefault(); // Lấy thông tin nhân viên từ API HR
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            User user;
            if (existingUser == null) {
                // Tạo mới record
                user = new User {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = nhanVien?.TenNhanVien ?? "",
                    AvatarUrl = nhanVien?.Anh,
                    CreatedAt = DateTime.UtcNow,
                    LastAccessAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            } else {
                // Nếu muốn, có thể update FullName/AvatarUrl
                existingUser.FullName = nhanVien?.TenNhanVien ?? existingUser.FullName;
                existingUser.AvatarUrl = nhanVien?.Anh ?? existingUser.AvatarUrl;
                existingUser.LastAccessAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                user = existingUser;
            }

            // Lấy danh sách PermissionId của user
            var permissions = await _context.UserPermissions
                .Where(up => up.UserId == user.Id)
                .Select(up => up.PermissionId)
                .ToListAsync();

            var token = await GenerateJwtToken(request.Username, nhanVien); // Nếu login HR thành công -> tạo JWT riêng

            return Ok(new {
                token,
                username = request.Username,
                fullName = user.FullName,
                avatarUrl = user.AvatarUrl,
                permissions, // danh sách quyền
                expiresIn = _config.GetValue<int>("JwtSettings:ExpiryMinutes") * 60,
                nhanVien = nhanVien
            });
        }


        private async Task<string> GenerateJwtToken(string username, HrAuthService.EmployeeInfo? nhanVien)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, nhanVien.ID.ToString()), // cần claim này
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Tìm UserId từ bảng Users theo username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user != null) {
                // Lấy danh sách quyền
                var permissions = await _context.UserPermissions
                    .Where(up => up.UserId == user.Id)
                    .Join(_context.Permissions,
                          up => up.PermissionId,
                          p => p.Id,
                          (up, p) => p.Code)
                    .ToListAsync();

                foreach (var permission in permissions) {
                    claims.Add(new Claim(ClaimTypes.Role, permission));
                }
            }
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                //expires: DateTime.UtcNow.AddMinutes(jwtSettings.GetValue<int>("ExpiryMinutes")),
                   expires: DateTime.UtcNow.AddMinutes(3), // hết hạn sau 3 phút
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }


    


}
