using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HBM_HR_Admin_Angular2.Server.Filters {

    public class DwhAppTokenFilter : IAuthorizationFilter {

        private readonly IConfiguration _config;
        public DwhAppTokenFilter(IConfiguration config) {
            _config = config;
        }

        public void OnAuthorization(AuthorizationFilterContext context) {
            var requestToken = context.HttpContext.Request.Headers["X-App-Token"].FirstOrDefault();
            var dwhToken = _config["AppSettings:DwhToken"];

            if (string.IsNullOrEmpty(requestToken) || requestToken != dwhToken) {
                context.Result = new UnauthorizedObjectResult("Invalid DWH App Token");
            }
        }
    }

}
