using HBM_HR_Admin_Angular2.Server.Data;
using Microsoft.AspNetCore.Mvc;
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
    }

}
