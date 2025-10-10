using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
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
            var id = (request.Id != null && request.Id != Guid.Empty)? request.Id : Guid.NewGuid();
            var nguoiNhanID = request.NguoiNhanID;
            if (nguoiNhanID == null) {
                return BadRequest(ApiResponse<String>.Error("Người nhận góp ý không xác định"));
            }
            var maTraCuu = $"GY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6]}";

            var gopY = new GY_GopY {
                ID = id,
                TieuDe = request.TieuDe,
                NoiDung = request.NoiDung,
                NhanVienID = string.IsNullOrEmpty(request.NhanVienID) ? null : request.NhanVienID,
                NguoiNhanID = request.NguoiNhanID,
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

            return Ok(ApiResponse<string>.Success("Tạo góp ý thành công"));
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

            // JOIN lấy thêm tên + chức danh + ảnh người gửi và nhận
            var items = await (
                from g in query
                join nvGui in _context.DbNhanVien on g.NhanVienID equals nvGui.ID into nvGuiJoin
                from nvGui in nvGuiJoin.DefaultIfEmpty()
                join nvNhan in _context.DbNhanVien on g.NguoiNhanID equals nvNhan.ID into nvNhanJoin
                from nvNhan in nvNhanJoin.DefaultIfEmpty()
                orderby g.NgayGui descending
                select new GopYResponse {
                    ID = g.ID,
                    TieuDe = g.TieuDe,
                    NhanVienID = g.NhanVienID,
                    NoiDung = g.NoiDung,
                    NgayGui = g.NgayGui,
                    TrangThai = g.TrangThai,
                    MaTraCuu = g.MaTraCuu,

                    // Người gửi
                    TenNguoiGui = nvGui != null ? nvGui.TenNhanVien : (g.NhanVienID == null ? "Nặc danh" : null),
                    AnhNguoiGui = nvGui != null ? nvGui.Anh : null,
                    TenChucDanhNguoiGui = nvGui != null ? nvGui.TenChucDanh : null,

                    // Người nhận
                    TenNguoiNhan = nvNhan != null ? nvNhan.TenNhanVien : null,
                    AnhNguoiNhan = nvNhan != null ? nvNhan.Anh : null,
                    TenChucDanhNguoiNhan = nvNhan != null ? nvNhan.TenChucDanh : null
                }
            )
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

            var result = new PagedResultGopY {
                TotalItems = totalItems,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = items
            };

            return Ok(ApiResponse<PagedResultGopY>.Success(result));
        }

        [HttpPost("GetChiTiet")]
        public async Task<IActionResult> GetChiTiet([FromBody] GopYChiTietRequest request) {
            if (request == null || request.Id == Guid.Empty)
                return BadRequest("Id không hợp lệ.");

            var gopy = await (
                from x in _context.GY_GopYs
                join nvGui in _context.DbNhanVien on x.NhanVienID equals nvGui.ID into nvGuiJoin
                from nvGui in nvGuiJoin.DefaultIfEmpty()
                join nvNhan in _context.DbNhanVien on x.NguoiNhanID equals nvNhan.ID into nvNhanJoin
                from nvNhan in nvNhanJoin.DefaultIfEmpty()
                where x.ID == request.Id
                select new GopYChiTietDto {
                    Id = x.ID,
                    TieuDe = x.TieuDe,
                    NoiDung = x.NoiDung,
                    NhanVienId = x.NhanVienID,
                    CreatedDate = x.NgayGui,

                    // 👇 Người gửi
                    TenNguoiGui = nvGui != null ? nvGui.TenNhanVien : (x.NhanVienID == null ? "Nặc danh" : null),
                    AnhNguoiGui = nvGui != null ? nvGui.Anh : null,
                    TenChucDanhNguoiGui = nvGui != null ? nvGui.TenChucDanh : null,

                    // 👇 Người nhận
                    TenNguoiNhan = nvNhan != null ? nvNhan.TenNhanVien : null,
                    AnhNguoiNhan = nvNhan != null ? nvNhan.Anh : null,
                    TenChucDanhNguoiNhan = nvNhan != null ? nvNhan.TenChucDanh : null,

                    // 👇 File đính kèm
                    Files = _context.GY_FileDinhKems
                                .Where(f => f.GopYID == x.ID)
                                .Select(f => new FileDto {
                                    FileName = f.TenFile,
                                    FileUrl = f.DuongDan
                                }).ToList()
                }
            ).FirstOrDefaultAsync();

            if (gopy == null)
                return NotFound(ApiResponse<GopYChiTietDto>.Error("Không tìm thấy thông tin chi tiết về góp ý này."));

            return Ok(ApiResponse<GopYChiTietDto>.Success(gopy));
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

        [HttpPost("Delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteGopYRequest request) {
            var gopY = await _context.GY_GopYs.FindAsync(request.ID);

            if (gopY == null) {
                return NotFound(ApiResponse<String>.Error("Xoá góp ý thất bại"));
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

            return Ok(ApiResponse<String>.Success("Xoá góp ý thành công."));
        }

        [HttpPost("create-phanhoi")]
        public async Task<IActionResult> CreatePhanHoi([FromBody] CreatePhanHoiRequest request) {
            using var transaction = _context.Database.BeginTransaction();
            try {
                var phanHoi = new GY_PhanHoi {
                    ID = Guid.NewGuid(),
                    GopYID = request.GopYID,
                    NoiDung = request.NoiDung,
                    NguoiPhanHoiID = request.NguoiPhanHoiID,
                    NgayPhanHoi = DateTime.Now
                };
                _context.GY_PhanHois.Add(phanHoi);
                await _context.SaveChangesAsync();
                foreach (var fileName in request.Files) {
                    var fileRecord = new GY_FileDinhKem {
                        ID = Guid.NewGuid(),
                        PhanHoiID = phanHoi.ID,
                        TenFile = fileName.TenFile,
                        DuongDan = $"uploads/{fileName.TenFile}",
                        NgayTai = DateTime.Now
                    };
                    _context.GY_FileDinhKems.Add(fileRecord);
                    var srcPath = Path.Combine("tmp", fileName.TenFile);
                    var destPath = Path.Combine("uploads", fileName.TenFile);
                    if (System.IO.File.Exists(srcPath)) {
                        System.IO.File.Move(srcPath, destPath, overwrite: true);
                    }
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(ApiResponse<GY_PhanHoi>.Success(phanHoi));
            } catch (Exception ex) {
                await transaction.RollbackAsync();
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        [HttpPost("phanhoi/list")]
        public IActionResult PhanhoiList([FromBody] GopyPhanhoiListRequest request) {
            try {
                var query = _context.GY_PhanHois.AsQueryable();

                if (request.GopYID.HasValue && request.GopYID.Value != Guid.Empty) {
                    query = query.Where(x => x.GopYID == request.GopYID.Value);
                }

                var list = query
                    .OrderByDescending(x => x.NgayPhanHoi)
                    .ToList();

                return Ok(ApiResponse<List<GY_PhanHoi>>.Success(list));
            } catch (Exception ex) {
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        [HttpPost("phanhoi/create")]
        public async Task<IActionResult> CreatePhanHoi([FromBody] PhanHoiCreateRequest request) {
            if (request == null || string.IsNullOrWhiteSpace(request.NoiDung))
                return BadRequest("Nội dung phản hồi không được để trống.");

            var phanHoi = new GY_PhanHoi {
                ID = Guid.NewGuid(),
                GopYID = request.GopYID,
                NoiDung = request.NoiDung.Trim(),
                NguoiPhanHoiID = request.NguoiPhanHoiID,
                NgayPhanHoi = DateTime.Now
            };

            _context.GY_PhanHois.Add(phanHoi);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<String>.Success("Tạo phản hồi thành công."));
        }

    }

}
