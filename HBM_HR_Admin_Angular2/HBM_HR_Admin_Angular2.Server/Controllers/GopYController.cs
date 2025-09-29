using HBM_HR_Admin_Angular2.Server.Requesters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HBM_HR_Admin_Angular2.Server.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class GopYController : ControllerBase {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public GopYController(IConfiguration config) {
            _config = config;
            _connectionString = _config.GetConnectionString("DefaultConnection");
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] CreateGopYRequest request) {
            var id = Guid.NewGuid();
            var maTraCuu = $"GY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6]}";

            using (var conn = new SqlConnection(_connectionString)) {
                await conn.OpenAsync();
                var sql = @"
                INSERT INTO GY_GopYs (ID, TieuDe, NoiDung, NhanVienID, MaTraCuu, TrangThai, NgayGui)
                VALUES (@ID, @TieuDe, @NoiDung, @NhanVienID, @MaTraCuu, N'Chưa phản hồi', GETDATE())";

                using (var cmd = new SqlCommand(sql, conn)) {
                    cmd.Parameters.AddWithValue("@ID", id);
                    cmd.Parameters.AddWithValue("@TieuDe", request.TieuDe);
                    cmd.Parameters.AddWithValue("@NoiDung", request.NoiDung);
                    cmd.Parameters.AddWithValue("@NhanVienID", (object?)request.NhanVienID ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@MaTraCuu", maTraCuu);

                    await cmd.ExecuteNonQueryAsync();
                }
            }

            // Lưu file đính kèm (nếu có)
            if (request.Files != null && request.Files.Any()) {
                foreach (var file in request.Files) {
                    var fileId = Guid.NewGuid();
                    var filePath = Path.Combine("Uploads/GopY", fileId + Path.GetExtension(file.FileName));

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                    using (var stream = new FileStream(filePath, FileMode.Create)) {
                        await file.CopyToAsync(stream);
                    }

                    using (var conn = new SqlConnection(_connectionString)) {
                        await conn.OpenAsync();
                        var sql = @"
                        INSERT INTO GY_FileDinhKems (ID, GopYID, TenFile, DuongDan, NgayTai)
                        VALUES (@ID, @GopYID, @TenFile, @DuongDan, GETDATE())";

                        using (var cmd = new SqlCommand(sql, conn)) {
                            cmd.Parameters.AddWithValue("@ID", fileId);
                            cmd.Parameters.AddWithValue("@GopYID", id);
                            cmd.Parameters.AddWithValue("@TenFile", file.FileName);
                            cmd.Parameters.AddWithValue("@DuongDan", filePath);
                            await cmd.ExecuteNonQueryAsync();
                        }
                    }
                }
            }

            return Ok(new { Success = true, GopYID = id, MaTraCuu = maTraCuu });
        }
    }

}
