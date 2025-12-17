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
                string keySearch = filter.KeySearch?.Trim().ToLower();

                var query = _db.NV_NhacViec
                    .Where(n => n.UserID == userId && !n.DaXoa);
                // 🔹 Lọc theo loại công việc
                if (filter.LoaiCongViecID != null) {
                    query = query.Where(n => n.LoaiCongViecID == filter.LoaiCongViecID);
                }

                DateTime today = DateTime.Today;

                // 🔹 Lọc theo trạng thái
                if (trangThaiFilter == "today") {
                    query = query.Where(n => n.NgayGioNhac.HasValue &&
                                             n.NgayGioNhac.Value.Date == today);
                } else if (trangThaiFilter == "thisWeek") {
                    DateTime startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                    DateTime endOfWeek = startOfWeek.AddDays(6);
                    query = query.Where(n => n.NgayGioNhac.HasValue &&
                                             n.NgayGioNhac.Value.Date >= startOfWeek &&
                                             n.NgayGioNhac.Value.Date <= endOfWeek);
                } else if (trangThaiFilter == "completed") {
                    query = query.Where(n => n.TrangThai == "HoanThanh");
                } else if (trangThaiFilter == "overdue") {
                    query = query.Where(n =>
                        n.TrangThai != "HoanThanh" &&
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

                // 🔹 Lọc theo từ khóa (KeySearch)
                if (!string.IsNullOrEmpty(keySearch)) {
                    query = query.Where(n =>
                        (n.TieuDe ?? "").ToLower().Contains(keySearch) ||
                        (n.Tag ?? "").ToLower().Contains(keySearch) ||
                        (n.GhiChu ?? "").ToLower().Contains(keySearch));
                }

                // 🔹 Đếm tổng số bản ghi
                int totalCount = await query.CountAsync();

                // 🔹 Lấy dữ liệu 1 trang
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
                existing.LoaiCongViecID = model.LoaiCongViecID;

                await _db.SaveChangesAsync();
                return ApiResponse<NV_NhacViec>.Success(existing);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 4. Xóa nhắc việc (mềm)
        [HttpPost("DeleteSoft")]
        public async Task<ApiResponse<string>> DeleteSoft([FromBody] NhacViecDeleteRequest input) {
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

        // 4. Xóa nhắc việc (cứng)
        [HttpPost("Delete")]
        public async Task<ApiResponse<string>> Delete([FromBody] NhacViecDeleteRequest input) {
            try {
                Guid id = Guid.Parse((string)input.ID);
                var existing = await _db.NV_NhacViec
                    .FirstOrDefaultAsync(n => n.ID == id);
                if (existing == null)
                    return ApiResponse<string>.Error("Công việc không tồn tại");
                _db.NV_NhacViec.Remove(existing);
                await _db.SaveChangesAsync();
                return ApiResponse<string>.Success("Xóa thành công");
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 4. Xóa nhắc việc (mềm)
        [HttpPost("DeleteList")]
        public async Task<ApiResponse<string>> DeleteList([FromBody] DeleteListRequest input) {
            try {
                if (input.IDs == null || !input.IDs.Any())
                    return ApiResponse<string>.Error("Danh sách ID trống.");
                var guidList = input.IDs
                    .Select(id => Guid.TryParse(id, out var g) ? g : Guid.Empty)
                    .Where(g => g != Guid.Empty)
                    .ToList();
                if (!guidList.Any())
                    return ApiResponse<string>.Error("Danh sách ID không hợp lệ.");
                var existingList = await _db.NV_NhacViec
                    .Where(n => guidList.Contains(n.ID))
                    .ToListAsync();
                if (!existingList.Any())
                    return ApiResponse<string>.Error("Không tìm thấy công việc nào phù hợp.");
                foreach (var item in existingList) {
                    item.DaXoa = true;
                    item.NgayCapNhat = DateTime.Now;
                }
                await _db.SaveChangesAsync();
                return ApiResponse<string>.Success($"Đã xóa {existingList.Count} công việc thành công.");
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // 4. Xóa nhắc việc (cứng)
        [HttpPost("DeleteListHard")]
        public async Task<ApiResponse<string>> DeleteListHard([FromBody] DeleteListRequest input) {
            try {
                if (input.IDs == null || !input.IDs.Any())
                    return ApiResponse<string>.Error("Danh sách ID trống.");
                var guidList = input.IDs
                    .Select(id => Guid.TryParse(id, out var g) ? g : Guid.Empty)
                    .Where(g => g != Guid.Empty)
                    .ToList();
                if (!guidList.Any())
                    return ApiResponse<string>.Error("Danh sách ID không hợp lệ.");
                var existingList = await _db.NV_NhacViec
                    .Where(n => guidList.Contains(n.ID))
                    .ToListAsync();
                if (!existingList.Any())
                    return ApiResponse<string>.Error("Không tìm thấy công việc nào phù hợp.");
                // 🔥 XÓA CỨNG
                _db.NV_NhacViec.RemoveRange(existingList);
                await _db.SaveChangesAsync();
                return ApiResponse<string>.Success(
                    $"Đã xóa vĩnh viễn {existingList.Count} công việc."
                );
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }


        [HttpPost("MarkComplete")]
        public async Task<ApiResponse<NV_NhacViec>> MarkComplete([FromBody] MarkCompleteRequest input) {
            try {
                // ✅ Kiểm tra đầu vào hợp lệ
                if (string.IsNullOrEmpty(input.ID))
                    return ApiResponse<NV_NhacViec>.Error("Thiếu ID công việc.");

                Guid id = Guid.Parse(input.ID);
                var existing = await _db.NV_NhacViec.FirstOrDefaultAsync(n => n.ID == id);

                if (existing == null)
                    return ApiResponse<NV_NhacViec>.Error("Công việc không tồn tại.");

                // ✅ Cập nhật trạng thái theo request
                if (!string.IsNullOrEmpty(input.TrangThai))
                    existing.TrangThai = input.TrangThai;

                existing.NgayCapNhat = DateTime.Now;

                await _db.SaveChangesAsync();

                return ApiResponse<NV_NhacViec>.Success(existing);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("UpdateStatusList")]
        public async Task<ApiResponse<string>> UpdateStatusList([FromBody] UpdateTrangThaiRequestList input) {
            try {
                if (input.IDs == null || !input.IDs.Any())
                    return ApiResponse<string>.Error("Không có công việc nào được chọn");

                if (string.IsNullOrWhiteSpace(input.TrangThai))
                    return ApiResponse<string>.Error("Thiếu trạng thái cần cập nhật");

                // Chuyển List<string> sang List<Guid>
                var guids = input.IDs.Select(Guid.Parse).ToList();

                // Lấy danh sách Nhắc việc cần cập nhật
                var nhacViecs = await _db.NV_NhacViec
                    .Where(n => guids.Contains(n.ID))
                    .ToListAsync();

                if (!nhacViecs.Any())
                    return ApiResponse<string>.Error("Không tìm thấy công việc cần cập nhật");

                // Cập nhật trạng thái
                foreach (var nv in nhacViecs) {
                    nv.TrangThai = input.TrangThai;
                    nv.NgayCapNhat = DateTime.Now;
                }

                await _db.SaveChangesAsync();

                return ApiResponse<string>.Success(
                    $"Đã cập nhật {nhacViecs.Count} công việc sang trạng thái '{input.TrangThai}'"
                );
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
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
        public async Task<ApiResponse<NV_NhacViecDetailDto>> GetById([FromBody] NhacViecDeleteRequest input) {
            try {
                Guid id = Guid.Parse((string)input.ID);

                var result = await (
                    from n in _db.NV_NhacViec
                    join l in _db.NV_LoaiCongViec on n.LoaiCongViecID equals l.ID into lj
                    from lcv in lj.DefaultIfEmpty()
                    where n.ID == id
                    select new NV_NhacViecDetailDto {
                        ID = n.ID,
                        UserID = n.UserID,
                        TieuDe = n.TieuDe,
                        GhiChu = n.GhiChu,
                        NgayGioNhac = n.NgayGioNhac,
                        LapLai = n.LapLai,
                        MucDoUuTien = n.MucDoUuTien,
                        Tag = n.Tag,
                        TrangThai = n.TrangThai,
                        DaXoa = n.DaXoa,
                        NgayTao = n.NgayTao,
                        NgayCapNhat = n.NgayCapNhat,
                        IsSent = n.IsSent,
                        LoaiCongViecID = n.LoaiCongViecID,
                        TenLoaiCongViec = lcv != null ? lcv.TenLoai : null
                    }
                ).FirstOrDefaultAsync();

                if (result == null)
                    return ApiResponse<NV_NhacViecDetailDto>.Error("Công việc không tồn tại");

                return ApiResponse<NV_NhacViecDetailDto>.Success(result);
            } catch (Exception ex) {
                return ApiResponse<NV_NhacViecDetailDto>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("LoaiCongViecList")]
        public async Task<ApiResponse<List<NV_LoaiCongViec>>> LoaiCongViecList([FromBody] UserRequest input) {
            try {
                string userId = input.UserID;

                var query = _db.NV_LoaiCongViec
                    .Where(lcv => !lcv.DaXoa && (lcv.UserID == null || lcv.UserID == userId))
                    .OrderBy(lcv => lcv.ThuTuHienThi)
                    .ThenBy(lcv => lcv.TenLoai);

                var list = await query.ToListAsync();

                return ApiResponse<List<NV_LoaiCongViec>>.Success(list);
            } catch (Exception ex) {
                return ApiResponse<List<NV_LoaiCongViec>>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        //Tạo loại công việc
        [HttpPost("LoaiCongViecCreate")]
        public async Task<ApiResponse<NV_LoaiCongViec>> LoaiCongViecCreate([FromBody] NV_LoaiCongViec model) {
            try {
                model.ID = Guid.NewGuid();
                model.NgayTao = DateTime.Now;
                model.NgayCapNhat = DateTime.Now;
                await _db.NV_LoaiCongViec.AddAsync(model);
                await _db.SaveChangesAsync();
                return ApiResponse<NV_LoaiCongViec>.Success(model);
            } catch (Exception ex) {
                return ApiResponse<NV_LoaiCongViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        //Tạo hoặc cập nhật loại công việc
        [HttpPost("LoaiCongViecUpdate")]
        public async Task<ApiResponse<NV_LoaiCongViec>> LoaiCongViecCreateOrUpdate([FromBody] NV_LoaiCongViec model) {
            try {
                if (model.ID == Guid.Empty || model.ID == default) {
                    // === Thêm mới ===
                    model.ID = Guid.NewGuid();
                    model.NgayTao = DateTime.Now;
                    model.NgayCapNhat = DateTime.Now;
                    await _db.NV_LoaiCongViec.AddAsync(model);
                } else {
                    // === Cập nhật ===
                    var existing = await _db.NV_LoaiCongViec.FirstOrDefaultAsync(x => x.ID == model.ID);
                    if (existing == null)
                        return ApiResponse<NV_LoaiCongViec>.Error("Không tìm thấy loại công việc cần cập nhật.");

                    existing.TenLoai = model.TenLoai;
                    existing.MoTa = model.MoTa;
                    existing.ThuTuHienThi = model.ThuTuHienThi;
                    existing.NgayCapNhat = DateTime.Now;
                    existing.DaXoa = model.DaXoa;
                    existing.UserID = model.UserID;
                }

                await _db.SaveChangesAsync();
                return ApiResponse<NV_LoaiCongViec>.Success(model);
            } catch (Exception ex) {
                return ApiResponse<NV_LoaiCongViec>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // Xóa nhiều loại công việc (mềm)
        [HttpPost("LoaiCongViecDeleteList")]
        public async Task<ApiResponse<string>> LoaiCongViecDeleteList([FromBody] DeleteListRequest input) {
            try {
                if (input.IDs == null || !input.IDs.Any())
                    return ApiResponse<string>.Error("Danh sách ID trống.");

                // Chuyển sang Guid
                var guidList = input.IDs
                    .Select(id => Guid.TryParse(id, out var g) ? g : Guid.Empty)
                    .Where(g => g != Guid.Empty)
                    .ToList();

                if (!guidList.Any())
                    return ApiResponse<string>.Error("Danh sách ID không hợp lệ.");

                // Lấy danh sách loại công việc
                var existingList = await _db.NV_LoaiCongViec
                    .Where(lcv => guidList.Contains(lcv.ID))
                    .ToListAsync();

                if (!existingList.Any())
                    return ApiResponse<string>.Error("Không tìm thấy loại công việc nào phù hợp.");

                // Kiểm tra ràng buộc với NV_NhacViec
                var relatedTasks = await _db.NV_NhacViec
                    .Where(nv => nv.LoaiCongViecID != null && guidList.Contains(nv.LoaiCongViecID.Value) && !nv.DaXoa)
                    .GroupBy(nv => nv.LoaiCongViecID)
                    .Select(g => new { LoaiCongViecID = g.Key, Count = g.Count() })
                    .ToListAsync();

                if (relatedTasks.Any()) {
                    var messages = new List<string>();
                    foreach (var r in relatedTasks) {
                        var loai = existingList.FirstOrDefault(x => x.ID == r.LoaiCongViecID);
                        if (loai != null) {
                            messages.Add($"- '{loai.TenLoai}' có {r.Count} nhắc việc liên quan.");
                        }
                    }

                    var msg = "Không thể xoá vì:\n" +
                              string.Join("\n", messages) +
                              "\n\nHãy xoá hoặc chuyển nhắc việc sang loại khác trước khi xoá.";
                    return ApiResponse<string>.Error(msg);
                }

                // Xóa mềm các loại công việc hợp lệ
                foreach (var item in existingList) {
                    item.DaXoa = true;
                    item.NgayCapNhat = DateTime.Now;
                }

                await _db.SaveChangesAsync();

                return ApiResponse<string>.Success($"Đã xoá {existingList.Count} loại công việc thành công.");
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("LoaiCongViecUpdateViTriList")]
        public async Task<ApiResponse<string>> LoaiCongViecUpdateViTriList([FromBody] UpdateViTriRequestList input) {
            try {
                if (input.Items == null || !input.Items.Any())
                    return ApiResponse<string>.Error("Danh sách vị trí cập nhật trống.");

                // Lấy toàn bộ ID
                var guids = input.Items.Select(i => i.ID).ToList();

                // Lấy danh sách loại công việc cần cập nhật
                var loaiCongViecs = await _db.NV_LoaiCongViec
                    .Where(l => guids.Contains(l.ID))
                    .ToListAsync();

                if (!loaiCongViecs.Any())
                    return ApiResponse<string>.Error("Không tìm thấy loại công việc phù hợp.");

                // Cập nhật vị trí mới cho từng loại công việc
                foreach (var item in input.Items) {
                    var entity = loaiCongViecs.FirstOrDefault(l => l.ID == item.ID);
                    if (entity != null) {
                        entity.ThuTuHienThi = item.ThuTuHienThi;
                        entity.NgayCapNhat = DateTime.Now;
                    }
                }

                await _db.SaveChangesAsync();

                return ApiResponse<string>.Success($"Đã cập nhật vị trí cho {loaiCongViecs.Count} loại công việc.");
            } catch (Exception ex) {
                return ApiResponse<string>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

    }

}