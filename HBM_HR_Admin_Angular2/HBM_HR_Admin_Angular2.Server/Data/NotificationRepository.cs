using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public class NotificationRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly string _connectionString;
        private readonly ILogger<NotificationRepository> _logger;

        public NotificationRepository(ApplicationDbContext context, IConfiguration configuration, ILogger<NotificationRepository> logger)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        public async Task<Notification> CreateNotification(Notification notification)
        {
            try
            {
                var parameters = new[]
                {
                    new SqlParameter("@ID", SqlDbType.VarChar) { Value = notification.ID },
                    new SqlParameter("@Title", SqlDbType.NVarChar) { Value = notification.Title },
                    new SqlParameter("@Content", SqlDbType.NVarChar) { Value = notification.Content },
                    new SqlParameter("@NotificationType", SqlDbType.TinyInt) { Value = notification.NotificationType },
                    new SqlParameter("@NguoiTao", SqlDbType.VarChar) { Value = notification.NguoiTao } // You might want to get this from the current user
                };
                await _context.Database.ExecuteSqlRawAsync("EXEC InsertNotification @ID, @Title, @Content, @NotificationType, @NguoiTao", parameters);
                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                throw;
            }
        }

        public async Task<IEnumerable<Notification>> GetNotificationsWithPaging0(int pageIndex, int pageSize, int notificationType)
        {
            try
            {
                _logger.LogInformation($"Calling stored procedure with notificationType: {notificationType}");
                using var connection = new SqlConnection(_connectionString);
                var result = await connection.QueryAsync<Notification>(
                    "NS_ADTB_GetNotificationsWithPaging",
                    new
                    {
                        PageNumber = pageIndex,
                        PageSize = pageSize,
                        NotificationType = notificationType
                    },
                    commandType: CommandType.StoredProcedure
                );
                _logger.LogInformation($"Stored procedure returned {result.Count()} records");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications with paging");
                throw;
            }
        }

        public async Task<(List<Notification> Notifications, int TotalCount)> GetNotificationsWithPaging1(int pageIndex, int pageSize, int notificationType)
        {
            try
            {
                _logger.LogInformation($"Calling stored procedure with notificationType: {notificationType}");
                using var connection = new SqlConnection(_connectionString);

                var result = await connection.QueryAsync<Notification>(
                    "NS_ADTB_GetNotificationsWithPaging",
                    new
                    {
                        PageNumber = pageIndex,
                        PageSize = pageSize,
                        NotificationType = notificationType
                    },
                    commandType: CommandType.StoredProcedure
                );

                // Lấy TotalCount từ phần tử đầu tiên (giả sử tất cả phần tử có TotalCount giống nhau)
                int totalCount = 0;

                _logger.LogInformation($"Stored procedure returned {result.Count()} records, TotalCount: {totalCount}");

                return (result.ToList(), totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications with paging");
                throw;
            }
        }

        public async Task<PagedResult<Notification>> GetNotificationsWithPaging(
            int pageIndex,
            int pageSize,
            int notificationType,
            string? loaiThongBao,
            int? isSentToAll,
            string? sortBy,
            string? searchText,
            string? ngayTaoTu,
            string? ngayTaoDen,
            string? ngayGuiTu,
            string? ngayGuiDen,
            string? ngTaoIds,
            string? platform,
            int? trangThai)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new
                {
                    PageNumber = pageIndex,
                    PageSize = pageSize,
                    NotificationType = notificationType,
                    LoaiThongBao = loaiThongBao,
                    IsSentToAll = isSentToAll,
                    SortBy = sortBy,
                    SearchText = searchText,
                    FromDate = string.IsNullOrWhiteSpace(ngayTaoTu) ? (DateTime?)null : DateTime.Parse(ngayTaoTu),
                    ToDate = string.IsNullOrWhiteSpace(ngayTaoDen) ? (DateTime?)null : DateTime.Parse(ngayTaoDen),
                    FromSentDate = string.IsNullOrWhiteSpace(ngayGuiTu) ? (DateTime?)null : DateTime.Parse(ngayGuiTu),
                    ToSentDate = string.IsNullOrWhiteSpace(ngayGuiDen) ? (DateTime?)null : DateTime.Parse(ngayGuiDen),
                    NgTaoIds = ngTaoIds,
                    Platform = platform,
                    SentStatus = trangThai
                };
                var result = await connection.QueryAsync<Notification>("NS_ADTB_GetNotificationsWithPaging",parameters,commandType: CommandType.StoredProcedure);
                int totalCount = 0;
                return new PagedResult<Notification>
                {
                    items = result.ToList(),
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications with paging");
                throw;
            }
        }

        public async Task<Notification?> GetNotificationByID(string notificationID)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var result = await connection.QueryFirstOrDefaultAsync<Notification>(
                    "NS_ADTB_GetNotificationById",
                    new
                    {
                        NotificationID = notificationID
                    },
                    commandType: CommandType.StoredProcedure
                );
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetNotificationByID error");
                throw;
            }
        }

        public async Task DeleteNotification(string notificationId)
        {
            try
            {
                _logger.LogInformation($"Deleting notification with ID: {notificationId}");
                using var connection = new SqlConnection(_connectionString);
                await connection.ExecuteAsync(
                    "NS_ADTB_DeleteNotification",
                    new { NotificationID = notificationId },
                    commandType: CommandType.StoredProcedure
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"ERR: DeleteNotification {notificationId}");
                throw;
            }
        }

        public async Task DeleteMultiNotification(string notificationIds)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.ExecuteAsync(
                    "NS_ADTB_DeleteMultiNotification",
                    new { NotificationIDs = notificationIds },
                    commandType: CommandType.StoredProcedure
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error DeleteMultiNotification: {notificationIds}");
                throw;
            }
        }

        public async Task<Notification> UpdateNotification(Notification notification)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.ExecuteAsync(
                    "NS_ADTB_UpdateNotification",
                    new
                    {
                        ID = notification.ID,
                        Title = notification.Title,
                        Content = notification.Content,
                        NotificationType = notification.NotificationType,
                        NguoiSua = "System" // You might want to get this from the current user
                    },
                    commandType: CommandType.StoredProcedure
                );
                _logger.LogInformation($"Successfully updated notification with ID: {notification.ID}");
                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating notification with ID: {notification.ID}");
                throw;
            }
        }

        public async Task InsertNotificationRecipient(string notificationId, string recipientId, string nguoiTao)
        {
            try
            {
                var parameters = new[]
                {
                    new SqlParameter("@NotificationId", SqlDbType.VarChar) { Value = notificationId },
                    new SqlParameter("@RecipientId", SqlDbType.VarChar) { Value = recipientId },
                    new SqlParameter("@NguoiTao", SqlDbType.VarChar) { Value = nguoiTao },
                };
                await _context.Database.ExecuteSqlRawAsync("EXEC InsertNotificationRecipient @NotificationId, @RecipientId, @NguoiTao", parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inserting notification recipient");
                throw;
            }
        }

        public async Task<IEnumerable<NotificationRecipient>> SelectNotificationRecipients(string notificationId)
        {
            try
            {
                var parameters = new
                {
                    NotificationId = notificationId,
                };
                using var connection = new SqlConnection(_connectionString);
                var result = await connection.QueryAsync<NotificationRecipient>(
                    "EXEC SelectNotificationRecipients @NotificationId",
                    parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inserting notification recipient");
                throw;
            }
        }

        public async Task DeleteNotificationRecipients(string notificationId)
        {
            _logger.LogInformation("DeleteNotificationRecipients - NotificationId: {NotificationId}", notificationId);
            try
            {
                var parameters = new
                {
                    NotificationId = notificationId,
                };
                using var connection = new SqlConnection(_connectionString);
                await connection.ExecuteAsync(
                    "EXEC DeleteNotificationRecipients @NotificationId",
                    parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification recipients for NotificationId: {NotificationId}", notificationId);
                throw;
            }
        }

        public async Task DeleteNotificationRecipients_Multi(IEnumerable<string> notificationIds)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                // Tạo DataTable để truyền vào TVP
                var table = new DataTable();
                table.Columns.Add("NotificationId", typeof(string));
                foreach (var id in notificationIds)
                {
                    table.Rows.Add(id);
                }
                var parameters = new { NotificationIds = table.AsTableValuedParameter("NotificationIdTableType") };
                await connection.ExecuteAsync("EXEC DeleteNotificationRecipients_Multiple @NotificationIds", parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error DeleteNotificationRecipients_Multi");
                throw;
            }
        }

        internal async Task<IEnumerable<DeviceTokenData>> GetDeviceTokenByEmployeeId(string iDNhanVien)
        {
            try
            {
                var parameters = new
                {
                    IDNhanVien = iDNhanVien,
                };
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync(); // 👈 THÊM DÒNG NÀY
                var result = await connection.QueryAsync<DeviceTokenData>(
                    "EXEC GetDeviceTokenByEmployeeId @IDNhanVien",
                    parameters);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting device token by employee ID");
                throw;
            }
        }

        internal async Task UpdateNotificationStatus(string notificationId)
        {
            try
            {
                var parameters = new
                {
                    NotificationId = notificationId,
                };
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync(); // 👈 thêm dòng này
                await connection.ExecuteAsync("EXEC UpdateNotificationStatus @NotificationId",parameters);
                _logger.LogInformation($"THONG BAO: {notificationId} - SENT");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification status");
                throw;
            }
        }

        internal async Task UpdateStatusSentDetail(string notificationId,string nguoiNhan){
            try
            {
                var parameters = new
                {
                    NotificationId = notificationId,
                    NguoiNhan = nguoiNhan,
                };
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();
                await connection.ExecuteAsync("EXEC UpdateStatusSentDetail @NotificationId, @NguoiNhan", parameters);
                _logger.LogInformation($"THONG BAO: {notificationId} - SENT TO: {nguoiNhan}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification status detail");
                throw;
            }
        }



    }

    public class DeviceTokenData
    {
        public string DeviceToken { get; set; }
        public string DeviceName { get; set; }
    }

}