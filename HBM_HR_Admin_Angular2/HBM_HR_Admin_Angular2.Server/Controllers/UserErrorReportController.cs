using Microsoft.AspNetCore.Mvc;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Helpers;
using HBM_HR_Admin_Angular2.Server.Models;
using Google.Api.Gax;
using System;
using Microsoft.EntityFrameworkCore;

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

        //mobile gửi 1 báo lỗi
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
                CreatedAt = DateTime.Now,
                Notes = dto.Notes,
            };
            _context.DbUserErrorReport.Add(log);
            await _context.SaveChangesAsync();
            return Ok(new {status = "SUCCESS", message = "Gửi báo lỗi thành công", logId = log.Id });
        }

        //trả về danh sách các báo lỗi - có phân trang
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserErrorReport>>> GetAllReports()
        {
            var reports = await (from r in _context.DbUserErrorReport orderby r.CreatedAt descending select r).ToListAsync();
            return Ok(reports);
        }

        //trả về chi tiết 1 báo lỗi
        [HttpGet("err_report/{id}")]
        public IActionResult GetReportDetail(int id)
        {
            var report = _context.DbUserErrorReport
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    r.Id,
                    r.Username,
                    r.TenNhanVien,
                    r.ApiUrl,
                    r.RequestJson,
                    r.ResponseJson,
                    r.VersionApp,
                    r.Device,
                    r.CreatedAt,
                    r.Notes
                })
                .FirstOrDefault();
            if (report == null)
                return NotFound(new { status = "FAIL", message = "Không tìm thấy báo lỗi với Id này."});
            return Ok(new { status = "SUCCESS", message = "",report});
        }

        // Xóa 1 báo lỗi
        [HttpGet("del/{id}")]
        public IActionResult DeleteReport(int id)
        {
            var report = _context.DbUserErrorReport.FirstOrDefault(r => r.Id == id);
            if (report == null)
            {
                return NotFound(new { status = "FAIL", message = "Không tìm thấy báo lỗi với Id này." });
            }
            _context.DbUserErrorReport.Remove(report);
            _context.SaveChanges();
            return Ok(new { status = "SUCCESS", message = "Đã xóa báo lỗi thành công." });
        }




    }

}




