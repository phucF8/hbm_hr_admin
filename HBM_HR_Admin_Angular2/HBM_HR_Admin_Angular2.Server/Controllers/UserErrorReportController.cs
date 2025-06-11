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
                Notes = dto.Notes
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

        [HttpGet("err_report/{id}")]
        public IActionResult GetReportDetail(int id)
        {
            var reportEntity = _context.DbUserErrorReport
                .FirstOrDefault(r => r.Id == id);

            if (reportEntity == null)
                return NotFound(new { status = "FAIL", message = "Không tìm thấy báo lỗi với Id này." });

            // Update Status to true (đã xem)
            try
            {
                reportEntity.Status = true;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "FAIL", message = "Lỗi khi cập nhật trạng thái báo lỗi." });
            }

            // Prepare response data
            var report = new
            {
                reportEntity.Id,
                reportEntity.Username,
                reportEntity.TenNhanVien,
                reportEntity.ApiUrl,
                reportEntity.RequestJson,
                reportEntity.ResponseJson,
                reportEntity.VersionApp,
                reportEntity.Device,
                reportEntity.CreatedAt,
                reportEntity.Notes,
                reportEntity.Status
            };

            return Ok(new { status = "SUCCESS", message = "", report });
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




