using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.EntityFrameworkCore;
using Dapper;

namespace HBM_HR_Admin_Angular2.Server.Repositories
{
    public class DebugRepository : IDebugRepository
    {
        private readonly IConfiguration _configuration;

        public DebugRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<NhanVienModel?> GetNhanVienByUsernameAsync(string username)
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            using var connection = new SqlConnection(connectionString);

            var result = await connection.QueryFirstOrDefaultAsync<NhanVienModel>(
                "sp_GetNhanVienByUsername",
                new { Username = username },
                commandType: CommandType.StoredProcedure);

            return result;
        }
    }

    public interface IDebugRepository
    {
        Task<NhanVienModel?> GetNhanVienByUsernameAsync(string username);
    }
}

    
