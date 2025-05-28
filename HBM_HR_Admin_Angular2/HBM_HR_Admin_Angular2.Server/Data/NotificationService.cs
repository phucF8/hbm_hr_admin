using Google.Api.Gax;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public interface INotificationService
    {
        Task<PagedResult<Notification>> GetNotificationsWithPaging(NotificationPagingRequest param);

    }

    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Notification>> GetNotificationsWithPaging(NotificationPagingRequest param)
        {
            //var query = _context.NotificationsWithRecipients.AsQueryable();
            var query = _context.V_ThongBao
                .Include(n => n.lsV_NhanThongBao)
                .AsQueryable();

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














            // var totalPages = (int)Math.Ceiling((double)totalCount / param.PageSize);
            // Phân trang
             // Log câu SQL trước khi thực thi
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
            var result = new PagedResult<Notification>
            {
                items = data,
                TotalCount = totalCount,
            };
            return result;
        }
    }
}

