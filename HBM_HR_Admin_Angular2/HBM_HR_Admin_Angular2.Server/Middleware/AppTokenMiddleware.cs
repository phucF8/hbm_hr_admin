using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HBM_HR_Admin_Angular2.Server.Middleware {
    public class AppTokenMiddleware {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _config;

        public AppTokenMiddleware(RequestDelegate next, IConfiguration config) {
            _next = next;
            _config = config;
        }

        public async Task Invoke(HttpContext context) {
            var path = context.Request.Path.Value?.ToLower();
            // Bỏ qua xác thực nếu là API ViewFile
            if (path != null && path.Contains("/api/fileupload/viewfile")) {
                await _next(context);
                return;
            }
            var appToken = _config["AppSettings:AppToken"];
            var requestToken = context.Request.Headers["X-App-Token"].FirstOrDefault();

            // Kiểm tra chỉ với các API public (ví dụ /api/public/*)
            bool b = context.Request.Path.StartsWithSegments("/api");
            if (b) {
                bool b2 = string.IsNullOrEmpty(requestToken) || requestToken != appToken;
                Console.WriteLine("requestToken = [" + requestToken+"]");
                Console.WriteLine("appToken = [" + appToken+"]");
                if (b2) {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Invalid App Token");
                    return;
                }
            }

            await _next(context);
        }
    }
}
