using Google.Api.Gax;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.DTOs;
using HBM_HR_Admin_Angular2.Server.Helpers;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Requesters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    //[Authorize] // ⬅️ chặn yêu cầu không có hoặc token không hợp lệ
    [Route("api/thongbao")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        private readonly FirebaseNotificationService _firebaseService;
        private readonly NotificationRepository _repository;
        private readonly IThongBaoService _notificationService;
        private readonly ILogger<ThongBaoController> _logger;

        private readonly ApplicationDbContext _context;

        public ThongBaoController(
            ApplicationDbContext context,
            FirebaseNotificationService firebaseService,
            NotificationRepository repository,
            IThongBaoService notificationService,
            ILogger<ThongBaoController> logger)
        {
            _context = context;
            _firebaseService = firebaseService;
            _repository = repository;
            _logger = logger;


            _notificationService = notificationService;

        }







        // API GET /api/thongbao - Lấy danh sách thông báo
        [HttpGet("api/thongbao/getnoti-dungsp")]
        public async Task<ActionResult<PagedResult<ThongBao>>> GetNotifications_dungSP(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = AppSettings.DefaultPageSize,
        [FromQuery] int notificationType = 0,
        [FromQuery] string? loaiThongBao = null,
        [FromQuery] int? isSentToAll = null,
        [FromQuery] string? sortBy = "ngayTao",
        [FromQuery] string? searchText = "",
        [FromQuery] string? ngayTaoTu = null,
        [FromQuery] string? ngayTaoDen = null,
        [FromQuery] string? ngayGuiTu = null,
        [FromQuery] string? ngayGuiDen = null,
        [FromQuery] string? ngTaoIds = null,
        [FromQuery] string? platform = null,
        [FromQuery] int? trangThai = null)
        {
            var notifications = await _repository.GetNotificationsWithPaging(
                pageIndex,
                pageSize,
                notificationType,
                loaiThongBao,
                isSentToAll,
                sortBy,
                searchText,
                ngayTaoTu,
                ngayTaoDen,
                ngayGuiTu,
                ngayGuiDen,
                ngTaoIds,
                platform,
                trangThai);
            return Ok(notifications);
        }


        // API GET /api/thongbao/{id} - Lấy 1 thông báo củ thể
        [HttpGet("{id}")]
        public async Task<ActionResult<ThongBaoDto>> GetThongBaoChiTiet(
            string id,
            [FromQuery] string? idNhanvien
        )
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest("Notification ID cannot be empty");
            }
            var notification = await _repository.GetNotificationByID(id);
            if (notification == null)
            {
                return NotFound($"Notification with ID {id} not found");
            }
            var result = await _repository.SelectNotificationRecipients(id);
            notification.DanhSachNguoiNhan = result.ToList();
            // ✅ Lặp qua từng người nhận để cập nhật trạng thái
            foreach (var nguoiNhan in notification.DanhSachNguoiNhan)
            {
                // Cập nhật trạng thái nếu ID người nhận khớp với idNhanvien
                if (nguoiNhan.NguoiNhan == idNhanvien)
                {
                    await _notificationService.nguoiNhanThongBaoUpdateStatus(id, idNhanvien,2);
                }
            }

            return Ok(notification);
        }

        // API POST /api/thongbao - Tạo thông báo mới
        [HttpPost]
        public async Task<ActionResult<ThongBao>> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                var notification = new ThongBao
                {
                    ID = request.ID,
                    Title = request.Title,
                    Content = request.Content,
                    NotificationType = request.NotificationType,
                    NguoiTao = request.NguoiTao
                };
                var result = await _repository.CreateNotification(notification);
                if (request.Recipients != null && request.Recipients.Any())
                {
                    foreach (var recipientId in request.Recipients)
                    {
                        await _repository.InsertNotificationRecipient(result.ID, recipientId, request.NguoiTao);
                    }
                }
                return CreatedAtAction(nameof(getListThongBao), new { id = result.ID }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return StatusCode(500, $"Đã xảy ra lỗi khi tạo thông báo: {ex.Message}");
            }
        }

        // API DELETE /api/thongbao/{id} - Xóa thông báo
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(string id)
        {
            try
            {
                await _repository.DeleteNotification(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return StatusCode(500, "Đã xảy ra lỗi khi xóa thông báo");
            }
        }

        // API DELETE /api/thongbao/batch - Xóa nhiều thông báo
        [HttpDelete("multi")]
        public async Task<IActionResult> DeleteMultipleNotifications([FromBody] string[] ids)
        {
            try
            {
                await _repository.DeleteMultiNotification(string.Join(",", ids));
                await _repository.DeleteNotificationRecipients_Multi(ids);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error DeleteMultipleNotifications");
                return StatusCode(500, "Đã xảy ra lỗi khi xóa thông báo");
            }
        }

        // API PUT /api/thongbao/{id} - Cập nhật thông báo
        [HttpPut("{id}")]
        public async Task<ActionResult<ThongBao>> UpdateNotification(string id, [FromBody] UpdateNotificationRequest request)
        {
            try
            {
                var notification = new ThongBao
                {
                    ID = id,
                    Title = request.Title,
                    Content = request.Content,
                    NotificationType = request.NotificationType,
                };
                var result = await _repository.UpdateNotification(notification);
                if (result == null)
                {
                    return NotFound($"Không tìm thấy thông báo với ID: {id}");
                }
                else
                {
                    // Delete recipients
                    await _repository.DeleteNotificationRecipients(notification.ID);
                    // Insert recipients
                    if (request.Recipients != null && request.Recipients.Any())
                    {
                        foreach (var recipientId in request.Recipients)
                        {
                            _logger.LogInformation($"InsertNotificationRecipient {result.ID}, {recipientId}, {"SYS"}");
                            await _repository.InsertNotificationRecipient(result.ID, recipientId, "");
                        }
                    }
                }

                _logger.LogInformation($"Successfully updated notification with ID: {id}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification");
                return StatusCode(500, "Đã xảy ra lỗi khi cập nhật thông báo");
            }
        }




        // API POST /api/thongbao/send - Gửi thông báo thử nghiệm
        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] TestSendNotificationRequest request)
        {
            int successCount = 0;
            int totalCount = 0;
            var userStats = new Dictionary<string, (int success, int total)>(); // Lưu thống kê theo user
            if (request == null || string.IsNullOrWhiteSpace(request.IDNhanViens))
            {
                return BadRequest("ID nhân viên là bắt buộc");
            }
            // Đảm bảo request.Data không null
            if (request.Data == null)
            {
                request.Data = new Dictionary<string, string>();
            }
            request.Data["Type"] = "tb";
            request.Data["ID"] = request.NotificationID;
            foreach (var id in request.IDNhanViens.Split(','))
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return BadRequest("ID nhân viên không hợp lệ");
                }
                var deviceTokens = await _repository.GetDeviceTokenByEmployeeId(id);
                if (deviceTokens == null || !deviceTokens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy token cho nhân viên {id}");
                    continue; // Không xử lý nếu không có token
                }
                int userSuccessCount = 0;
                int userTotalCount = deviceTokens.Count();
                var tokens = deviceTokens.Select(dt => dt.DeviceToken).ToList();



                var result = await _firebaseService.SendNotificationAsync(
                    tokens,
                    request.Title,
                    request.Body,
                    request.Data);
                if (result)
                {
                    userSuccessCount = userTotalCount;
                    await _repository.UpdateStatusSentDetail(request.NotificationID, id);
                }
                userStats[id] = (userSuccessCount, userTotalCount);
                successCount += userSuccessCount;
                totalCount += userTotalCount;
            }
            var summary = userStats.Select(userStat => new
            {
                UserId = userStat.Key,
                Success = userStat.Value.success,
                TotalTokens = userStat.Value.total,
                Status = userStat.Value.success > 0 ? "Success" : "Fail"
            });
            await _repository.UpdateNotificationStatus(request.NotificationID);
            return Ok(new
            {
                Message = "Notification sent done",
                SuccessCount = successCount,
                TotalCount = totalCount,
                SuccessRate = totalCount > 0 ? (double)successCount / totalCount * 100 : 0,
                UserStats = summary
            });
        }

        // API POST /api/thongbao/sendone - Gửi thông báo thử nghiệm (phiên bản 0)
        [HttpPost("sendone")]
        public async Task<IActionResult> SendNotificationOne([FromBody] TestSendNotificationRequest request)
        {
            int successCount = 0;
            int totalCount = 0;
            var userStats = new Dictionary<string, (int success, int total)>(); // Lưu thống kê theo user

            // Validate request
            if (request == null || string.IsNullOrWhiteSpace(request.IDNhanViens))
            {
                return BadRequest("ID nhân viên là bắt buộc");
            }

            foreach (var id in request.IDNhanViens.Split(','))
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return BadRequest("ID nhân viên không hợp lệ");
                }

                // Lấy token từ database
                var deviceTokens = await _repository.GetDeviceTokenByEmployeeId(id);
                if (deviceTokens == null || !deviceTokens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy token cho nhân viên {id}");
                    continue; // Không xử lý nếu không có token
                }

                int userSuccessCount = 0;
                int userTotalCount = deviceTokens.Count();

                // Gửi thông báo đến tất cả các token
                foreach (var deviceToken in deviceTokens)
                {
                    var result = await _firebaseService.SendNotificationAsync(
                        deviceToken.DeviceToken,
                        request.Title, request.Body,
                        request.Data);

                    if (result)
                    {
                        userSuccessCount++;
                    }
                }
                // Lưu thống kê cho user
                userStats[id] = (userSuccessCount, userTotalCount);
                // Cập nhật tổng số thành công và tổng số token
                successCount += userSuccessCount;
                totalCount += userTotalCount;
            }

            // Tính tổng kết thành công và thất bại cho các user
            var summary = userStats.Select(userStat => new
            {
                UserId = userStat.Key,
                Success = userStat.Value.success,
                TotalTokens = userStat.Value.total,
                Status = userStat.Value.success > 0 ? "Success" : "Fail"
            });

            return Ok(new
            {
                Message = "Notification sent done",
                SuccessCount = successCount,
                TotalCount = totalCount,
                SuccessRate = totalCount > 0 ? (double)successCount / totalCount * 100 : 0,
                UserStats = summary
            });
        }










        // API POST /api/thongbao/test - Gửi thông báo thử nghiệm (phiên bản 0)
        [HttpPost("test")]
        public async Task<IActionResult> TestNotification([FromBody] TestNotificationRequest request)
        {
            var userStats = new Dictionary<string, (int success, int total)>(); // Lưu thống kê theo user
            {
                String IDNhanVien = request.IDNhanVien;
                if (string.IsNullOrWhiteSpace(IDNhanVien))
                {
                    return BadRequest("ID nhân viên không hợp lệ");
                }
                // Lấy token từ database
                var deviceTokens = await _repository.GetDeviceTokenByEmployeeId(IDNhanVien);
                if (deviceTokens == null || !deviceTokens.Any())
                {
                    _logger.LogWarning($"Không tìm thấy token cho nhân viên {IDNhanVien}");

                }
                foreach (var deviceToken in deviceTokens)
                {
                    var result = await _firebaseService.TestNotificationAsync(
                        deviceToken.DeviceToken,
                        request.Title,
                        request.Body,
                        request.Badge
                        );
                    if (result)
                    {
                    }
                }
            }
            // Tính tổng kết thành công và thất bại cho các user
            var summary = userStats.Select(userStat => new
            {
                UserId = userStat.Key,
                Success = userStat.Value.success,
                TotalTokens = userStat.Value.total,
                Status = userStat.Value.success > 0 ? "Success" : "Fail"
            });
            return Ok(new
            {
                Message = "Notification sent done",
                UserStats = summary
            });
        }











        //API GET /api/thongbao - Lấy danh sách thông báo - LINKQ
        [HttpGet]
        public async Task<ActionResult<PagedResult<ThongBao>>> getListThongBao([FromQuery] NotificationPagingRequest param)
        {
            var result = await _notificationService.getListThongBao(param);
            return Ok(new
            {
                result.items,
                result.TotalCount,
            });


        }




        [HttpPost("notification_list")]
        public async Task<ActionResult<ApiResponse<object>>> NotificationList([FromBody] NotificationListRequest request) {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 20;

            // Lấy danh sách ID thông báo mà người dùng được nhận
            var listThongBaoIDs = await _context.AD_ThongBao_NguoiNhan
                .Where(x => x.IDNhanSu == request.UserID)
                .Select(x => x.IDThongBao)
                .ToListAsync();

            // Lọc các thông báo đó
            var query = from tb in _context.AD_ThongBao
                        join nv in _context.DbNhanVien on tb.IDNguoiGui equals nv.ID into gj
                        from nguoiGui in gj.DefaultIfEmpty()
                        where listThongBaoIDs.Contains(tb.ID)
                        select new { tb, nguoiGui };

            // Lọc thêm nếu có
            if (!string.IsNullOrEmpty(request.NhomThongBao))
                query = query.Where(x => x.tb.NhomThongBao == request.NhomThongBao);

            if (!string.IsNullOrEmpty(request.TrangThai))
                query = query.Where(x => x.tb.TrangThai == request.TrangThai);

            // Đếm tổng
            var totalCount = await query.CountAsync();

            // Phân trang
            var items = await query
                .OrderByDescending(x => x.tb.NgayGui)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new ThongBaoItemResponse {
                    ID = x.tb.ID,
                    IDNotify = x.tb.IDNotify,
                    TieuDe = x.tb.TieuDe,
                    NoiDung = x.tb.NoiDung,
                    NhomThongBao = x.tb.NhomThongBao,
                    TrangThai = x.tb.TrangThai,
                    AnDanh = x.tb.AnDanh,
                    NgayGui = x.tb.NgayGui,
                    TenNguoiGui = x.nguoiGui != null ? x.nguoiGui.TenNhanVien : "",
                    AnhNguoiGui = x.nguoiGui != null ? x.nguoiGui.Anh : ""
                })
                .ToListAsync();

            var result = new {
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = items
            };

            return Ok(ApiResponse<object>.Success(result, "Thành công"));
        }

        /// <summary>
        /// Đánh dấu thông báo là đã đọc (TrangThai = 1, cập nhật NgayDoc)
        /// </summary>
        [HttpPost("notification_mark_read")]
        public async Task<IActionResult> MarkAsRead([FromBody] UpdateTrangThaiNotificationRequest request) {
            if (request == null || request.IDThongBao == Guid.Empty || string.IsNullOrWhiteSpace(request.IDNhanSu))
                return BadRequest(ApiResponse<string>.Error("Dữ liệu không hợp lệ"));

            var record = await _context.AD_ThongBao_NguoiNhan
                .FirstOrDefaultAsync(x => x.IDThongBao == request.IDThongBao && x.IDNhanSu == request.IDNhanSu);

            if (record == null)
                return NotFound(ApiResponse<string>.Error("Không tìm thấy bản ghi thông báo"));

            record.TrangThai = 1;
            record.NgayDoc = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success("Đã đánh dấu là đã đọc"));
        }






    }


}




