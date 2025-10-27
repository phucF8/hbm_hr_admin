using HBM_HR_Admin_Angular2.Server.DTOs;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public interface IThongBaoService
    {
        Task<PagedResult<ThongBaoDto>> getListThongBao(NotificationPagingRequest param);
        Task<ApiResponse<String>> nguoiNhanThongBaoUpdateStatus(string idThongBao, string idNhanVien,byte status);

    }

    public class ThongBaoService : IThongBaoService
    {
        private readonly ApplicationDbContext _context;

        public ThongBaoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<ThongBaoDto>> getListThongBao(NotificationPagingRequest param)
        {
            var query = _context.DbThongBao
                .Join(_context.DbNhanVien,
                    tb => tb.NguoiTao,
                    nv => nv.ID,
                    (tb, nv) => new { tb, nv });
            // Áp dụng lọc ID người tạo (sau khi kiểm tra null)
            if (!string.IsNullOrWhiteSpace(param.NgTaoIds))
            {
                var ids = param.NgTaoIds
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList();
                query = query.Where(x => ids.Contains(x.tb.NguoiTao));
            }
            // Lọc theo người nhận
            if (!string.IsNullOrWhiteSpace(param.NgNhanIds))
            {
                var nhanIds = param.NgNhanIds
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList();
                query = query.Where(x =>
                    _context.DbThongBaoNguoiNhan.Any(nr =>
                        nr.IDThongBao == x.tb.ID &&
                        nhanIds.Contains(nr.NguoiNhan)
                    )
                );
            }

            // Các bộ lọc khác
            if (param.NotificationType.HasValue)
                query = query.Where(x => x.tb.NotificationType == param.NotificationType);
            if (!string.IsNullOrEmpty(param.LoaiThongBao))
                query = query.Where(x => x.tb.LoaiThongBao == param.LoaiThongBao);
            if (!string.IsNullOrEmpty(param.Platform))
                query = query.Where(x => x.tb.Platform == param.Platform);
            if (param.ngayTaoTu.HasValue)
                query = query.Where(x => x.tb.NgayTao >= param.ngayTaoTu.Value.Date);
            if (param.ngayTaoDen.HasValue)
            {
                var to = param.ngayTaoDen.Value.Date.AddDays(1).AddMilliseconds(-3);
                query = query.Where(x => x.tb.NgayTao <= to);
            }
            if (!string.IsNullOrWhiteSpace(param.SearchText))
            {
                var keyword = param.SearchText.ToLower();
                query = query.Where(x => x.tb.Title.ToLower().Contains(keyword) || x.tb.Content.ToLower().Contains(keyword));
            }
            if (param.isSentToAll != null)
            {
                if (param.isSentToAll == 1)
                {
                    // Tất cả người nhận đều có Status > 0
                    query = query.Where(x =>
                        _context.DbThongBaoNguoiNhan
                            .Where(nr => nr.IDThongBao == x.tb.ID)
                            .All(nr => nr.Status > 0)
                    );
                }
                else if (param.isSentToAll == 2)
                {
                    // Có ít nhất một người nhận có Status == 0
                    query = query.Where(x =>
                        _context.DbThongBaoNguoiNhan
                            .Where(nr => nr.IDThongBao == x.tb.ID)
                            .Any(nr => nr.Status == 0)
                    );
                }
            }


            var projected = query.Select(x => new ThongBaoDto
            {
                ID = x.tb.ID,
                Title = x.tb.Title,
                Content = x.tb.Content,
                NotificationType = x.tb.NotificationType,
                NguonUngDung = x.tb.NguonUngDung,
                LoaiThongBao = x.tb.LoaiThongBao,
                IDThamChieu = x.tb.IDThamChieu,
                Status = x.tb.Status,
                Platform = x.tb.Platform,
                NgayTao = x.tb.NgayTao,
                NgaySua = x.tb.NgaySua,
                NguoiTao = x.tb.NguoiTao,
                NguoiSua = x.tb.NguoiSua,
                TenNguoiTao = x.nv.TenNhanVien,
                AnhNguoiTao = x.nv.Anh,
                DanhSachNguoiNhan = (
                    from nr in _context.DbThongBaoNguoiNhan
                    join nvnn in _context.DbNhanVien on nr.NguoiNhan equals nvnn.ID
                    where nr.IDThongBao == x.tb.ID
                    select new NguoiNhanDto
                    {
                        ID = nr.ID,
                        IDThongBao = nr.IDThongBao,
                        NguoiNhan = nr.NguoiNhan,
                        Status = nr.Status,
                        NgayTao = nr.NgayTao,
                        NgaySua = nr.NgaySua,
                        TenNguoiNhan = nvnn.TenNhanVien,
                        AnhNguoiNhan = nvnn.Anh
                    }
                ).ToList()
            });
            projected = projected.OrderByDescending(x => x.NgayTao);
            // Pagination
            var totalCount = await projected.CountAsync();
            int pageIndex = param.pageIndex ?? 1;
            int pageSize = param.PageSize > 0 ? param.PageSize : 20;
            var data = await projected.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            string sql = EfSqlLogger.LogSqlWithParameters(projected);
            return new PagedResult<ThongBaoDto>
            {
                items = data,
                TotalCount = totalCount
            };
        }

        public async Task<ApiResponse<String>> nguoiNhanThongBaoUpdateStatus(string idThongBao, string idNhanVien, byte status)
        {
            // Tìm bản ghi phù hợp
            var record = await _context.DbThongBaoNguoiNhan
                .FirstOrDefaultAsync(x => x.IDThongBao == idThongBao && x.NguoiNhan == idNhanVien);

            if (record == null)
            {
                return ApiResponse<String>.Error("Không tìm thấy bản ghi phù hợp.");
            }

            // Cập nhật trạng thái
            record.Status = status;
            record.NgaySua = DateTime.Now;
            // Bạn có thể cập nhật cả NguoiSua nếu cần, ví dụ:
            // record.NguoiSua = idNguoiThucHien;

            await _context.SaveChangesAsync();

            return ApiResponse<String>.Error("Không tìm thấy bản ghi phù hợp.");

        }


    }
}

