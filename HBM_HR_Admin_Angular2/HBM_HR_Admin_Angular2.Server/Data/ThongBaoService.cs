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
            .Join(_context.NS_NhanViens,
                tb => tb.NguoiTao,
                nv => nv.ID,
                (tb, nv) => new { tb, nv })
            .Select(x => new ThongBaoDto
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
                TenNhanVien = x.nv.TenNhanVien,
                AnhNhanVien = x.nv.Anh,
                DanhSachNguoiNhan = (
                    from nr in _context.DbThongBaoNguoiNhan
                    join nvnn in _context.NS_NhanViens on nr.NguoiNhan equals nvnn.ID
                    where nr.IDThongBao == x.tb.ID
                    select new NguoiNhanDto
                    {
                        ID = nr.ID,
                        IDThongBao = nr.IDThongBao,
                        NguoiNhan = nr.NguoiNhan,
                        Status = nr.Status,
                        NgayTao = nr.NgayTao,
                        NgaySua = nr.NgaySua,
                        TenNhanVien = nvnn.TenNhanVien,
                        AnhNhanVien = nvnn.Anh
                    }
                ).ToList()
            });
            if (param.NotificationType != null)
            {
                int? type = param.NotificationType;
                query = query.Where(x => x.NotificationType == type);
            }
            if (!string.IsNullOrEmpty(param.LoaiThongBao))
                query = query.Where(x => x.LoaiThongBao == param.LoaiThongBao);

            if (!string.IsNullOrEmpty(param.Platform))
                query = query.Where(x => x.Platform == param.Platform);
            if (param.ngayTaoTu.HasValue)
                query = query.Where(x => x.NgayTao >= param.ngayTaoTu.Value.Date);
            if (param.ngayTaoDen.HasValue)
            {
                var to = param.ngayTaoDen.Value.Date.AddDays(1).AddMilliseconds(-3);
                query = query.Where(x => x.NgayTao <= to);
            }
            if (!string.IsNullOrWhiteSpace(param.SearchText))
            {
                var keyword = param.SearchText.ToLower();
                query = query.Where(x => x.Title.Contains(keyword) || x.Content.Contains(keyword));
            }
            if (!string.IsNullOrWhiteSpace(param.NgTaoIds))
            {
                var ngTaoIdList = param.NgTaoIds
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList();
                query = query.Where(x => ngTaoIdList.Contains(x.NguoiTao));
            }
            query = query.OrderByDescending(x => x.NgayTao);
            var totalCount = await query.CountAsync();
            string sql = EfSqlLogger.LogSqlWithParameters(query, 
                new
                {
                    param.SearchText,
                }
            );
            Console.WriteLine(sql);
            int pageIndex = param.pageIndex ?? 1;
            int pageSize = param.PageSize > 0 ? param.PageSize : 20; // fallback nếu cần
            var data = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var result = new PagedResult<ThongBaoDto>
            {
                items = data,
                TotalCount = totalCount,
            };
            return result;
        }
    }
}

