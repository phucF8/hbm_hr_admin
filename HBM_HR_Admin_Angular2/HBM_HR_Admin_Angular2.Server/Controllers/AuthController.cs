namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using System.Collections.Generic;

    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private static readonly Dictionary<string, string> users = new()
    {
        { "admin", "123456" } // Giả lập user (bạn có thể kết nối DB)
    };

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (users.ContainsKey(request.Username) && users[request.Username] == request.Password)
            {
                return Ok(new { token = "fake-jwt-token", username = request.Username });
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
