using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public interface IThongBaoService
    {
        Task<PagedResult<ThongBaoDto>> getListThongBao(NotificationPagingRequest param);

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
    }
}

