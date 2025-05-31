namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    using Azure.Core;
    using HBM_HR_Admin_Angular2.Server.constance;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;
    using System.Collections.Generic;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;

    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        public AuthController(JwtTokenGenerator jwtTokenGenerator)
        {
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        private static readonly Dictionary<string, string> users = new()
        {
            { "admin", "123456" } // Giả lập user (bạn có thể kết nối DB)
        };

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (users.ContainsKey(request.Username) && users[request.Username] == request.Password)
            {
                Console.WriteLine($"username = {request.Username}");
                var token = _jwtTokenGenerator.GenerateToken(request.Username);
                Console.WriteLine($"token = {token}");
                return Ok(new { token = token, username = request.Username });
            }
            return Unauthorized("Sai tên đăng nhập hoặc mật khẩu");
        }

    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }


    


}
