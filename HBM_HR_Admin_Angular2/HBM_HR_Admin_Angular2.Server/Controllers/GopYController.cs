using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Requesters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class GopYController : ControllerBase {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        private readonly ApplicationDbContext _context;

        public GopYController(
            ApplicationDbContext context,
            IConfiguration config) {
            _context = context;
            _config = config;
            _connectionString = _config.GetConnectionString("DefaultConnection");
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateGopYRequest request) {
            var id = (request.Id != null && request.Id != Guid.Empty)
        ? request.Id
        : Guid.NewGuid();
            var maTraCuu = $"GY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6]}";

            var gopY = new GY_GopY {
                ID = id,
                TieuDe = request.TieuDe,
                NoiDung = request.NoiDung,
                NhanVienID = string.IsNullOrEmpty(request.NhanVienID) ? null : request.NhanVienID,
                MaTraCuu = maTraCuu,
                TrangThai = "Chưa phản hồi",
                NgayGui = DateTime.Now,
                Files = new List<GY_FileDinhKem>()
            };

            // Nếu có file trong request thì xử lý
            if (request.Files != null && request.Files.Any()) {
                foreach (var f in request.Files) {
                    var fileId = Guid.NewGuid();
                    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                    var tmpPath = Path.Combine(Directory.GetCurrentDirectory(), f.DuongDan);

                    if (!Directory.Exists(uploadsPath))
                        Directory.CreateDirectory(uploadsPath);

                    var destFile = Path.Combine(uploadsPath, f.TenFile);

                    // Copy từ tmp → uploads
                    if (System.IO.File.Exists(tmpPath))
                        System.IO.File.Move(tmpPath, destFile, true);

                    gopY.Files.Add(new GY_FileDinhKem {
                        ID = fileId,
                        GopYID = id,
                        PhanHoiID = null, // vì file này thuộc về góp ý
                        TenFile = f.TenFile,
                        DuongDan = Path.Combine("uploads", f.TenFile),
                        NgayTai = DateTime.Now
                    });
                }
            }

            _context.GY_GopYs.Add(gopY);
            await _context.SaveChangesAsync();

            return Ok(new {
                Success = true,
                GopYID = id,
                MaTraCuu = maTraCuu
            });
        }




        [HttpPost("GetGopYs")]
        public async Task<ActionResult<PagedResultGopY>> GetGopYs([FromBody] GopYQueryRequest request) {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;

            var query = _context.GY_GopYs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search)) {
                query = query.Where(g => g.NoiDung.Contains(request.Search));
            }

            var totalItems = await query.LongCountAsync();

            var items = await query
                .OrderByDescending(g => g.NgayGui)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(g => new GopYResponse {
                    ID = g.ID,
                    NhanVienID = g.NhanVienID,
                    NoiDung = g.NoiDung,
                    NgayGui = g.NgayGui,
                    TrangThai = g.TrangThai
                })
                .ToListAsync();

            var result = new PagedResultGopY {
                TotalItems = totalItems,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = items
            };

            return Ok(result);
        }

        [HttpPost("GetChiTiet")]
        public async Task<IActionResult> GetChiTiet([FromBody] GopYChiTietRequest request) {
            if (request == null || request.Id == Guid.Empty)
                return BadRequest("Id không hợp lệ.");

            var gopy = await _context.GY_GopYs
                .Where(x => x.ID == request.Id)
                .Select(x => new GopYChiTietDto {
                    Id = x.ID,
                    NoiDung = x.NoiDung,
                    NhanVienId = x.NhanVienID,
                    CreatedDate = x.NgayGui,
                    Files = _context.GY_FileDinhKems
                                .Where(f => f.GopYID == x.ID)
                                .Select(f => new FileDto {
                                    FileName = f.TenFile,
                                    FileUrl = f.DuongDan
                                }).ToList()
                })
                .FirstOrDefaultAsync();

            if (gopy == null)
                return NotFound("Không tìm thấy góp ý.");

            return Ok(gopy);
        }

        [HttpPost("GetGopYsByNhanVien")]
        public async Task<ActionResult<PagedResultGopY>> GetGopYsByNhanVien([FromBody] GopYByNhanVienRequest request) {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;

            var query = _context.GY_GopYs.AsQueryable();

            // lọc theo NhanVienID
            query = query.Where(g => g.NhanVienID == request.NhanVienID);

            // tìm kiếm theo nội dung (nếu có)
            if (!string.IsNullOrWhiteSpace(request.Search)) {
                query = query.Where(g => g.NoiDung.Contains(request.Search));
            }

            var totalItems = await query.LongCountAsync();

            var items = await query
                .OrderByDescending(g => g.NgayGui)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(g => new GopYResponse {
                    ID = g.ID,
                    NhanVienID = g.NhanVienID,
                    NoiDung = g.NoiDung,
                    NgayGui = g.NgayGui,
                    TrangThai = g.TrangThai
                })
                .ToListAsync();

            var result = new PagedResultGopY {
                TotalItems = totalItems,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = items
            };

            return Ok(result);
        }

        [HttpPost("PhanHoi")]
        public async Task<IActionResult> PhanHoi([FromForm] CreatePhanHoiRequest request) {
            var id = Guid.NewGuid();

            // 1. Lưu phản hồi
            var phanHoi = new GY_PhanHoi {
                ID = id,
                GopYID = request.GopYID,
                NhanVienID = request.NhanVienID,
                NoiDung = request.NoiDung,
                NgayGui = DateTime.Now
            };

            _context.GY_PhanHois.Add(phanHoi);

            // 2. Lưu file đính kèm (nếu có)
            if (request.Files != null && request.Files.Any()) {
                foreach (var file in request.Files) {
                    var fileId = Guid.NewGuid();
                    var filePath = Path.Combine("Uploads/PhanHoi", fileId + Path.GetExtension(file.FileName));

                    Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                    using (var stream = new FileStream(filePath, FileMode.Create)) {
                        await file.CopyToAsync(stream);
                    }

                    var fileEntity = new GY_FileDinhKem {
                        ID = fileId,
                        GopYID = request.GopYID,
                        PhanHoiID = id,
                        TenFile = file.FileName,
                        DuongDan = filePath,
                        NgayTai = DateTime.Now
                    };

                    _context.GY_FileDinhKems.Add(fileEntity);
                }
            }

            // Lưu vào DB
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, PhanHoiID = id });
        }

        [HttpPost("Delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteGopYRequest request) {
            var gopY = await _context.GY_GopYs.FindAsync(request.ID);

            if (gopY == null) {
                return NotFound(new { Success = false, Message = "Không tìm thấy góp ý." });
            }

            // Xoá luôn file đính kèm và phản hồi liên quan (nếu muốn)
            var files = _context.GY_FileDinhKems.Where(f => f.GopYID == request.ID);
            _context.GY_FileDinhKems.RemoveRange(files);

            var phanHois = _context.GY_PhanHois.Where(p => p.GopYID == request.ID).ToList();
            foreach (var ph in phanHois) {
                var filesPh = _context.GY_FileDinhKems.Where(f => f.PhanHoiID == ph.ID);
                _context.GY_FileDinhKems.RemoveRange(filesPh);
            }
            _context.GY_PhanHois.RemoveRange(phanHois);

            // Xoá góp ý
            _context.GY_GopYs.Remove(gopY);

            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Xoá góp ý thành công." });
        }

    }

}
