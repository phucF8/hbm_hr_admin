using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

public class NotificationRepository
{
    private readonly string _connectionString;

    public NotificationRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public async Task<IEnumerable<Notification>> GetNotificationsWithPaging(int pageNumber, int pageSize)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<Notification>("NS_ADTB_GetNotificationsWithPaging", new { PageNumber = pageNumber, PageSize = pageSize, NotificationType = 0 },
            commandType: CommandType.StoredProcedure
        );
    }
}
