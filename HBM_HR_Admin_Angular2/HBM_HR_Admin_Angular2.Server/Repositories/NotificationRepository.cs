using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Logging;

public class NotificationRepository
{
    private readonly string _connectionString;
    private readonly ILogger<NotificationRepository> _logger;

    public NotificationRepository(IConfiguration configuration, ILogger<NotificationRepository> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
        _logger = logger;
    }

    public async Task<IEnumerable<Notification>> GetNotificationsWithPaging(int pageNumber, int pageSize, int notificationType = 0)
    {
        _logger.LogInformation($"Calling stored procedure with notificationType: {notificationType}");
        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<Notification>(
            "NS_ADTB_GetNotificationsWithPaging", 
            new { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                NotificationType = notificationType 
            },
            commandType: CommandType.StoredProcedure
        );
        _logger.LogInformation($"Stored procedure returned {result.Count()} records");
        return result;
    }
}
