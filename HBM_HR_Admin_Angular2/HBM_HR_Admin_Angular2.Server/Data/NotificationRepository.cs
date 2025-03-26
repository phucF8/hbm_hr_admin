using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
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
                _logger.LogInformation($"Creating new notification: {notification.Title}");
                
                var parameters = new[]
                {
                    new SqlParameter("@ID", SqlDbType.VarChar) { Value = Guid.NewGuid().ToString() },
                    new SqlParameter("@Title", SqlDbType.NVarChar) { Value = notification.Title },
                    new SqlParameter("@Content", SqlDbType.NVarChar) { Value = notification.Content },
                    new SqlParameter("@SenderId", SqlDbType.VarChar) { Value = notification.SenderId ?? (object)DBNull.Value },
                    new SqlParameter("@TriggerAction", SqlDbType.NVarChar) { Value = notification.TriggerAction ?? (object)DBNull.Value },
                    new SqlParameter("@NotificationType", SqlDbType.TinyInt) { Value = notification.NotificationType },
                    new SqlParameter("@SentAt", SqlDbType.DateTime) { Value = notification.SentAt ?? (object)DBNull.Value },
                    new SqlParameter("@NguoiTao", SqlDbType.VarChar) { Value = "System" }, // You might want to get this from the current user
                    new SqlParameter("@NguoiSua", SqlDbType.VarChar) { Value = "System" }  // You might want to get this from the current user
                };

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC InsertNotification @ID, @Title, @Content, @SenderId, @TriggerAction, @NotificationType, @SentAt, @NguoiTao, @NguoiSua",
                    parameters);

                _logger.LogInformation($"Successfully created notification with ID: {notification.ID}");
                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                throw;
            }
        }

        public async Task<IEnumerable<Notification>> GetNotificationsWithPaging(int pageIndex, int pageSize, int notificationType)
        {
            try
            {
                _logger.LogInformation($"Calling stored procedure with notificationType: {notificationType}");
                using var connection = new SqlConnection(_connectionString);
                var result = await connection.QueryAsync<Notification>(
                    "NS_ADTB_GetNotificationsWithPaging",
                    new { 
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
                _logger.LogInformation($"Successfully deleted notification with ID: {notificationId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting notification with ID: {notificationId}");
                throw;
            }
        }
    }
} 