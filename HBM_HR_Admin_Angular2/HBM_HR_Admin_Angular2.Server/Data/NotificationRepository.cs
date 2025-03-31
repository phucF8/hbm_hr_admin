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
                    //new SqlParameter("@ID", SqlDbType.VarChar) { Value = Guid.NewGuid().ToString() },
                    new SqlParameter("@ID", SqlDbType.VarChar) { Value = notification.ID },
                    new SqlParameter("@Title", SqlDbType.NVarChar) { Value = notification.Title },
                    new SqlParameter("@Content", SqlDbType.NVarChar) { Value = notification.Content },
                    new SqlParameter("@SenderId", SqlDbType.VarChar) { Value = notification.SenderId ?? (object)DBNull.Value },
                   
                    new SqlParameter("@NotificationType", SqlDbType.TinyInt) { Value = notification.NotificationType },
                    new SqlParameter("@SentAt", SqlDbType.DateTime) { Value = notification.SentAt ?? (object)DBNull.Value },
                    new SqlParameter("@NguoiTao", SqlDbType.VarChar) { Value = "System" }, // You might want to get this from the current user
                    new SqlParameter("@NguoiSua", SqlDbType.VarChar) { Value = "System" }  // You might want to get this from the current user
                };

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC InsertNotification @ID, @Title, @Content, @SenderId, @NotificationType, @SentAt, @NguoiTao, @NguoiSua",
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

        public async Task<Notification?> GetNotificationByID(string notificationID)
        {
            try
            {
                _logger.LogInformation($"GetNotificationByID: {notificationID}");
                using var connection = new SqlConnection(_connectionString);
                var result = await connection.QueryFirstOrDefaultAsync<Notification>(
                    "NS_ADTB_GetNotificationById",
                    new {
                        NotificationID = notificationID 
                    },
                    commandType: CommandType.StoredProcedure
                );
                if (result != null)
                {
                    _logger.LogInformation("Stored procedure returned a record");
                }
                else
                {
                    _logger.LogInformation("No record found for the given notification ID");
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification by ID");
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

        public async Task DeleteMultiNotification(string notificationIds)
        {
            try
            {
                _logger.LogInformation($"Deleting multiple notifications with IDs: {notificationIds}");
                using var connection = new SqlConnection(_connectionString);
                await connection.ExecuteAsync(
                    "NS_ADTB_DeleteMultiNotification",
                    new { NotificationIDs = notificationIds },
                    commandType: CommandType.StoredProcedure
                );
                _logger.LogInformation($"Successfully deleted multiple notifications");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting multiple notifications with IDs: {notificationIds}");
                throw;
            }
        }

        public async Task<Notification> UpdateNotification(Notification notification)
        {
            try
            {
                _logger.LogInformation($"Updating notification with ID: {notification.SentAt}");
                using var connection = new SqlConnection(_connectionString);
                await connection.ExecuteAsync(
                    "NS_ADTB_UpdateNotification",
                    new { 
                        ID = notification.ID,
                        Title = notification.Title,
                        Content = notification.Content,
                        NotificationType = notification.NotificationType,
                        SentAt = notification.SentAt,
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
    
    
        public async Task InsertNotificationRecipient(string notificationId, string recipientId, string creatorId)
        {
            try
            {
                var parameters = new[]
                {
                    new SqlParameter("@NotificationId", SqlDbType.VarChar) { Value = notificationId },
                    new SqlParameter("@RecipientId", SqlDbType.VarChar) { Value = recipientId },
                    new SqlParameter("@NguoiTao", SqlDbType.VarChar) { Value = creatorId }
                };

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC InsertNotificationRecipient @NotificationId, @RecipientId, @NguoiTao",
                    parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inserting notification recipient");
                throw;
            }
        }
    }
} 