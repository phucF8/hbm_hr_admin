using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using HBM_HR_Admin_Angular2.Server.Repositories;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/debug")]
    public class DebugController : ControllerBase
    {
        private readonly ILogger<DebugController> _logger;

         private readonly IDebugRepository _debugRepository;

        public DebugController(ILogger<DebugController> logger,IDebugRepository debugRepository)
        {
            _logger = logger;
            _debugRepository = debugRepository;
        }


        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("DebugController is working!");
        }

        [HttpGet("env")]
        public IActionResult GetEnvironment()
        {
            var env = Environment.GetEnvironmentVariables();
            return Ok(env);
        }

        [HttpGet("process")]
        public IActionResult GetProcessInfo()
        {
            var process = Process.GetCurrentProcess();
            return Ok(new
            {
                ProcessName = process.ProcessName,
                Id = process.Id,
                StartTime = process.StartTime,
                MemoryUsageMB = process.WorkingSet64 / (1024 * 1024)
            });
        }

        [HttpGet("headers")]
        public IActionResult GetHeaders()
        {
            var headers = Request.Headers;
            return Ok(headers.ToDictionary(h => h.Key, h => h.Value.ToString()));
        }





        [HttpGet("get_nv_by_username")]
        public async Task<IActionResult> GetNhanVienByUsername([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
                return BadRequest("Username is required.");

            var nhanVien = await _debugRepository.GetNhanVienByUsernameAsync(username);

            if (nhanVien == null)
                return NotFound("User not found.");

            return Ok(nhanVien);
        }



    }
}
