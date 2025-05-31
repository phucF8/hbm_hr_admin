using Microsoft.AspNetCore.Mvc;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Helpers;
using HBM_HR_Admin_Angular2.Server.Models;
using Google.Api.Gax;
using System;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/user_err_report")]
    public class UserErrorReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserErrorReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("err_report")]
        public async Task<IActionResult> ErrReport([FromBody] UserErrorReportDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var log = new UserErrorReport
            {
                Username = dto.Username,
                TenNhanVien = dto.TenNhanVien,
                ApiUrl = dto.ApiUrl,
                RequestJson = dto.RequestJson,
                ResponseJson = dto.ResponseJson,
                VersionApp = dto.VersionApp,
                Device = dto.Device,
                CreatedAt = DateTime.Now
            };
            _context.DbUserErrorReport.Add(log);
            await _context.SaveChangesAsync();
            return Ok(new {status = "SUCCESS", message = "Gửi báo lỗi thành công", logId = log.Id });
        }
    }














}




