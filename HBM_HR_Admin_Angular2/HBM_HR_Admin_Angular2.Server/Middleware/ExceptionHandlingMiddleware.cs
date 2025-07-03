using HBM_HR_Admin_Angular2.Server.Models.Common;
using System.Text.Json;

namespace HBM_HR_Admin_Angular2.Server.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var result = JsonSerializer.Serialize(ApiResponse<string>.Error("Lỗi hệ thống: " + ex.Message));
                await context.Response.WriteAsync(result);
            }
        }
    }

}
