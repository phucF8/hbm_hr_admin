using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.DTOs;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Requesters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HBM_HR_Admin_Angular2.Server.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class NhacViecController : ControllerBase {
        private readonly ApplicationDbContext _db;

        public NhacViecController(ApplicationDbContext db) {
            _db = db;
        }

        // 1. Lấy danh sách nhắc việc
        [HttpPost("List")]
        public async Task<ApiResponse<PagedResult<NV_NhacViec>>> List([FromBody] NhacviecListRequest filter) {
            try {
                string userId = filter.UserID;
                string trangThaiFilter = filter.Filter;
                int pageNumber = filter.PageNumber <= 0 ? 1 : filter.PageNumber;
                int pageSize = filter.PageSize <= 0 ? 20 : filter.PageSize;
                var query = _db.NV_NhacViec.Where(n => n.UserID == userId && !n.DaXoa);
                DateTime today = DateTime.Today;
                // Lọc theo trạng thái all, today, thisWeek, completed, overdue
                if (trangThaiFilter == "today") {
                    query = query.Where(n => n.NgayGioNhac.HasValue && n.NgayGioNhac.Value.Date == today);
                } else if (trangThaiFilter == "thisWeek") {
                    DateTime startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                    DateTime endOfWeek = startOfWeek.AddDays(6);
                    query = query.Where(n => n.NgayGioNhac.HasValue &&
                                             n.NgayGioNhac.Value.Date >= startOfWeek &&
                                             n.NgayGioNhac.Value.Date <= endOfWeek);
                } else if (trangThaiFilter == "completed") { 
                    query = query.Where(n => n.TrangThai == "HoanThanh");
                } else if (trangThaiFilter == "overdue") {
                    query = query.Where(n => n.TrangThai != "HoanThanh" && 
                        n.NgayGioNhac.HasValue &&
                        n.NgayGioNhac.Value.Date < today);
                } else {
                    DateTime tuNgay = filter.TuNgay?.Date ?? DateTime.Today.AddMonths(-3);
                    DateTime denNgay = filter.DenNgay?.Date ?? DateTime.Today.AddMonths(3);
                    query = query.Where(n =>
                        n.NgayGioNhac.HasValue &&
                        n.NgayGioNhac.Value.Date >= tuNgay &&
                        n.NgayGioNhac.Value.Date <= denNgay);
                }



                    // Đếm tổng số bản ghi
                    int totalCount = await query.CountAsync();

                // Lấy dữ liệu 1 trang
                var items = await query
                    .OrderByDescending(n => n.NgayGioNhac)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var result = new PagedResult<NV_NhacViec> {
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    items = items
                };

                return ApiResponse<PagedResult<NV_NhacViec>>.Success(result);
            } catch (Exception ex) {
                return ApiResponse<PagedResult<NV_NhacViec>>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }


        // 2. Tạo nhắc việc
        [HttpPost("Create")]
        public async Task<ApiResponse<NV_NhacViec>> Create([FromBody] NV_NhacViec model) {
            try {
                model.ID = Guid.NewGuid();
                model.NgayTao = DateTime.Now;
                model.NgayCapNhat = DateTime.Now;
                model.GhiChu = model.GhiChu;
                await _db.NV_NhacViec.AddAsync(model);
                await _db.SaveChangesAsync();
                return ApiResponse<NV_NhacViec>.Success(model);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 3. Cập nhật nhắc việc
        [HttpPost("Update")]
        public async Task<ApiResponse<NV_NhacViec>> Update([FromBody] NV_NhacViec model) {
            try {
                var existing = await _db.NV_NhacViec.FirstOrDefaultAsync(n => n.ID == model.ID);
                if (existing == null)
                    return ApiResponse<NV_NhacViec>.Error("Công việc không tồn tại");

                existing.TieuDe = model.TieuDe;
                existing.GhiChu = model.GhiChu;
                existing.NgayGioNhac = model.NgayGioNhac;
                existing.LapLai = model.LapLai;
                existing.MucDoUuTien = model.MucDoUuTien;
                existing.Tag = model.Tag;
                existing.TrangThai = model.TrangThai;
                existing.NgayCapNhat = DateTime.Now;

                await _db.SaveChangesAsync();
                return ApiResponse<NV_NhacViec>.Success(existing);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 4. Xóa nhắc việc (mềm)
        [HttpPost("Delete")]
        public async Task<ApiResponse<string>> Delete([FromBody] NhacViecDeleteRequest input) {
            try {
                Guid id = Guid.Parse((string)input.ID);
                var existing = await _db.NV_NhacViec.FirstOrDefaultAsync(n => n.ID == id);
                if (existing == null)
                    return ApiResponse<string>.Error("Công việc không tồn tại");

                existing.DaXoa = true;
                existing.NgayCapNhat = DateTime.Now;

                await _db.SaveChangesAsync();
                return ApiResponse<string>.Success("Xóa thành công");
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 5. Đánh dấu hoàn thành
        [HttpPost("MarkComplete")]
        public async Task<ApiResponse<NV_NhacViec>> MarkComplete([FromBody] MarkCompleteRequest input) {
            try {
                Guid id = Guid.Parse((string)input.ID);
                var existing = await _db.NV_NhacViec.FirstOrDefaultAsync(n => n.ID == id);
                if (existing == null)
                    return ApiResponse<NV_NhacViec>.Error("Công việc không tồn tại");

                existing.TrangThai = "HoanThanh";
                existing.NgayCapNhat = DateTime.Now;

                await _db.SaveChangesAsync();
                return ApiResponse<NV_NhacViec>.Success(existing);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 6. Hoãn nhắc việc (Snooze)
        [HttpPost("Snooze")]
        public async Task<ApiResponse<NV_NhacViec>> Snooze([FromBody] dynamic input) {
            try {
                Guid id = Guid.Parse((string)input.ID);
                int minutes = (int)input.Minutes;

                var existing = await _db.NV_NhacViec.FirstOrDefaultAsync(n => n.ID == id);
                if (existing == null)
                    return ApiResponse<NV_NhacViec>.Error("Công việc không tồn tại");

                if (!existing.NgayGioNhac.HasValue)
                    return ApiResponse<NV_NhacViec>.Error("Công việc chưa có thời gian nhắc");

                existing.NgayGioNhac = existing.NgayGioNhac.Value.AddMinutes(minutes);
                existing.NgayCapNhat = DateTime.Now;

                await _db.SaveChangesAsync();
                return ApiResponse<NV_NhacViec>.Success(existing, $"Hoãn {minutes} phút thành công");
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 7. Lấy chi tiết nhắc việc theo ID
        [HttpPost("detail")]
        public async Task<ApiResponse<NV_NhacViec>> GetById([FromBody] NhacViecDeleteRequest input) {
            try {
                Guid id = Guid.Parse((string)input.ID);
                var existing = await _db.NV_NhacViec.FirstOrDefaultAsync(n => n.ID == id);
                if (existing == null)
                    return ApiResponse<NV_NhacViec>.Error("Công việc không tồn tại");

                return ApiResponse<NV_NhacViec>.Success(existing);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

    }

}