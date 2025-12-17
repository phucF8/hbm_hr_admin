using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.DTOs;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Requesters;
using HBM_HR_Admin_Angular2.Server.Services;
using HBM_HR_Admin_Angular2.Server.Utility;
using LinqToDB.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace HBM_HR_Admin_Angular2.Server.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class GopYController : ControllerBase {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        private readonly ApplicationDbContext _context;

        private readonly FirebaseNotificationService _firebaseService;
        private readonly NotificationRepository _repository;
        private readonly NotificationService _notificationService;

        public GopYController(
            ApplicationDbContext context,
            FirebaseNotificationService firebaseService,
            NotificationRepository repository,
            NotificationService notificationService,
            IConfiguration config) {
            _context = context;
            _config = config;
            _connectionString = _config.GetConnectionString("DefaultConnection");
            _notificationService = notificationService;
            _firebaseService = firebaseService;
            _repository = repository;
        }

        /// <summary>
        /// copy file từ thư mục wwwroot/tmp sang thư mục wwwroot/uploads, ko xoá file trong tmp ngay vì tránh lỗi lock file
        /// quá trình xoá sẽ được thực hiện tự động vào 12h pm cùng ngày
        /// </summary>
        /// <param name="duongDanTuClient"></param>
        /// <returns></returns>
        private string? MoveFileFromTmpToUploads(string duongDanTuClient) {
            try {
                // Chuẩn hóa lại đường dẫn (bỏ dấu "/" đầu nếu có)
                var relativePath = duongDanTuClient.TrimStart('/', '\\');

                // Xác định thư mục gốc wwwroot
                var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

                // Đường dẫn vật lý của file trong tmp
                var sourcePath = Path.Combine(wwwrootPath, relativePath);

                // Tên file thực tế (đã đổi tên khi upload)
                var fileName = Path.GetFileName(sourcePath);

                // Thư mục đích uploads
                var uploadDir = Path.Combine(wwwrootPath, "uploads");
                if (!Directory.Exists(uploadDir))
                    Directory.CreateDirectory(uploadDir);

                var destPath = Path.Combine(uploadDir, fileName);

                // ✅ Thêm retry khi file còn bị lock (file đang được ghi)
                for (int i = 0; i < 5; i++) {
                    try {
                        if (!System.IO.File.Exists(sourcePath)) {
                            Console.WriteLine($"⚠️ File không tồn tại: {sourcePath}");
                            return null;
                        }

                        // ✅ Copy thay vì Move — không xóa file gốc
                        System.IO.File.Copy(sourcePath, destPath, true);

                        // Trả về đường dẫn tương đối để lưu DB
                        return Path.Combine("uploads", fileName).Replace("\\", "/");
                    } catch (IOException ioEx) when (ioEx.Message.Contains("being used by another process")) {
                        // File đang bị lock → đợi 200ms rồi thử lại
                        Thread.Sleep(200);
                    }
                }

                Console.WriteLine($"⚠️ Hết thời gian chờ, file vẫn bị lock: {sourcePath}");
                return null;
            } catch (Exception ex) {
                Console.WriteLine($"❌ Lỗi khi copy file {duongDanTuClient}: {ex.Message}");
                return null;
            }
        }

        [HttpPost("create")]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateGopYRequest request) {
            try {
                var gopyID = (request.Id != null && request.Id != Guid.Empty)? request.Id : Guid.NewGuid();
                var nguoiNhanID = request.NguoiNhanID;
                if (nguoiNhanID == null) {
                    return BadRequest(ApiResponse<String>.Error("Người nhận góp ý không xác định"));
                }
                // ✅ Kiểm tra người gửi
                if (string.IsNullOrEmpty(request.NhanVienID)) {
                    return BadRequest(ApiResponse<string>.Error("Người gửi góp ý không xác định"));
                }
                // ✅ Kiểm tra người gửi và người nhận không được trùng nhau
                if (request.NhanVienID == nguoiNhanID) {
                    return BadRequest(ApiResponse<string>.Error("Người gửi và người nhận không được trùng nhau"));
                }
                // ✅ Giới hạn gửi góp ý ẩn danh
                if (request.AnDanh) {
                    var today = DateTime.Today;
                    var countAnDanh = await _context.GY_GopYs
                        .CountAsync(g => g.NhanVienID == request.NhanVienID
                                         && g.AnDanh
                                         && g.NgayGui >= today
                                         && g.NgayGui < today.AddDays(1));
                    if (countAnDanh >= 3) {
                        return BadRequest(ApiResponse<string>.Error("Bạn đã gửi quá 3 góp ý ẩn danh trong ngày"));
                    }
                }
                var maTraCuu = $"GY-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6]}";
                //string enrNoiDung = EncryptUtil.Encrypt(request.NoiDung);
                string enrNoiDung = request.NoiDung;
                var gopY = new GY_GopY {
                    ID = gopyID,
                    TieuDe = request.TieuDe,
                    NoiDung = enrNoiDung,
                    AnDanh = request.AnDanh,
                    NhanVienID = string.IsNullOrEmpty(request.NhanVienID) ? null : request.NhanVienID,
                    NguoiNhanID = request.NguoiNhanID,
                    MaTraCuu = maTraCuu,
                    TrangThai = "GY_CD",
                    NgayGui = DateTime.Now,
                    Files = new List<GY_FileDinhKem>()
                };
                if (request.Files != null && request.Files.Any()) {
                    foreach (var f in request.Files) {
                        var fileId = Guid.NewGuid();
                        var relativePath = MoveFileFromTmpToUploads(f.DuongDan);

                        gopY.Files.Add(new GY_FileDinhKem {
                            ID = fileId,
                            GopYID = gopyID,
                            PhanHoiID = null,
                            TenFile = f.TenFile,
                            DuongDan = relativePath ?? Path.Combine("tmp", f.TenFile).Replace("\\", "/"),
                            NgayTai = DateTime.Now
                        });
                    }
                }// Nếu có file trong request thì xử lý
                _context.GY_GopYs.Add(gopY);
                await _context.SaveChangesAsync();
                await _notificationService.CreateThongBaoAsync(
                    gopyID,
                    request.AnDanh,
                    request.TieuDe,
                    request.NhanVienID ?? "",
                    new List<string> { request.NguoiNhanID! }
                );
                var data = new Dictionary<string, string>();
                data["Role"] = "GY";
                data["Type"] = "gy";
                data["ID"] = gopY?.ID.ToString() ?? "";
                data["messageId"] = "";
                var result = _firebaseService.SendNotificationToEmployeesAsync(nguoiNhanID, request.TieuDe, request.NoiDung, data, _firebaseService, _repository);
                return Ok(ApiResponse<string>.Success("Tạo góp ý thành công"));
            } catch (Exception ex) {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(ApiResponse<string>.Error(innerMessage));
            }
        }

        [HttpPost("GetGopYs")]
        public async Task<ActionResult<PagedResultGopY>> GetGopYs([FromBody] GopYQueryRequest request) {
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var query = _context.GY_GopYs.AsQueryable();
            var currentUserId = request.userId;
            // Lọc theo loại yêu cầu
            if (!string.IsNullOrWhiteSpace(request.TypeRequest)) {
                switch (request.TypeRequest.ToUpper()) {
                    case "BY_ME": // Góp ý do tôi gửi
                        query = query.Where(g => g.NhanVienID == currentUserId);
                        break;
                    case "TO_ME": // Góp ý gửi tới tôi
                        query = query.Where(g => g.NguoiNhanID == currentUserId);
                        break;
                    default:
                        return BadRequest(ApiResponse<string>.Error("Giá trị TypeRequest không hợp lệ (BY_ME hoặc TO_ME)"));
                }
            }
            // 🟢 Lọc theo trạng thái (CD, DD, XL, HUY, v.v.)
            if (!string.IsNullOrWhiteSpace(request.TrangThai)) {
                query = query.Where(g => g.TrangThai == request.TrangThai);
            }
            // 🟢 Lọc theo nhóm (Quan tâm, Ko Quan Tâm, Chưa Phân Loại, Tất cả)
            switch (request.FilterType) {
                case "CPL": // Chưa phân loại
                    query = query.Where(x => x.GroupID == null);
                    break;
                case "": // Tất cả
                    break;
                default:
                    query = query.Where(x => x.GroupID == request.FilterType);
                    break;
            }
            // 🔍 Lọc theo từ khóa tìm kiếm
            if (!string.IsNullOrWhiteSpace(request.Search)) {
                query = query.Where(g => g.NoiDung.Contains(request.Search)
                                      || g.TieuDe.Contains(request.Search)
                                      || g.MaTraCuu.Contains(request.Search));
            }
            var totalItems = await query.LongCountAsync();
            // JOIN lấy thêm thông tin người gửi & người nhận
            var items = await (
                from g in query
                join nvGui in _context.DbNhanVien on g.NhanVienID equals nvGui.ID into nvGuiJoin
                from nvGui in nvGuiJoin.DefaultIfEmpty()
                join nvNhan in _context.DbNhanVien on g.NguoiNhanID equals nvNhan.ID into nvNhanJoin
                from nvNhan in nvNhanJoin.DefaultIfEmpty()

                // 🔵 JOIN thêm bảng Group
                join gr in _context.GY_Group on g.GroupID equals gr.ID into grJoin
                from gr in grJoin.DefaultIfEmpty()

                orderby g.NgayGui descending
                select new GopYResponse {
                    ID = g.ID,
                    TieuDe = g.TieuDe,
                    NhanVienID = g.NhanVienID,
                    NoiDung = g.NoiDung,
                    NgayGui = g.NgayGui,
                    TrangThai = g.TrangThai,
                    MaTraCuu = g.MaTraCuu,
                    AnDanh = g.AnDanh,
                    // Người gửi
                    TenNguoiGui = nvGui != null ? nvGui.TenNhanVien : (g.NhanVienID == null ? "Nặc danh" : null),
                    AnhNguoiGui = nvGui != null ? nvGui.Anh : null,
                    TenChucDanhNguoiGui = nvGui != null ? nvGui.TenChucDanh : null,
                    // Người nhận
                    TenNguoiNhan = nvNhan != null ? nvNhan.TenNhanVien : null,
                    AnhNguoiNhan = nvNhan != null ? nvNhan.Anh : null,
                    TenChucDanhNguoiNhan = nvNhan != null ? nvNhan.TenChucDanh : null,
                    // 🔵 Trả về Group
                    GroupID = g.GroupID,
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

        [HttpPost("unreadGopY")]
        public async Task<ActionResult<int>> GetSoLuongGopYChuaDoc([FromBody] GopYUnreadCountRequest request) {
            if (string.IsNullOrWhiteSpace(request.userId)) {
                return BadRequest(ApiResponse<string>.Error("Không xác định được người dùng."));
            }
            var currentUserId = request.userId;
            // Đếm số lượng góp ý gửi đến tôi và có trạng thái "GY_CD"
            var count = await _context.GY_GopYs
                .Where(g => g.NguoiNhanID == currentUserId && g.TrangThai == "GY_CD")
                .CountAsync();
            return Ok(ApiResponse<int>.Success(count));
        }

        [HttpPost("AddGopyItem")]
        public async Task<IActionResult> GetGopYById([FromBody] AddGopyItemRequest request) {
            if (request == null || request.Id == Guid.Empty) {
                return BadRequest(ApiResponse<string>.Error("ID không hợp lệ"));
            }
            var gopy = await (from g in _context.GY_GopYs
                              join ng in _context.DbNhanVien on g.NhanVienID equals ng.ID into nguoiGuiGroup
                              from nguoiGui in nguoiGuiGroup.DefaultIfEmpty()
                              join nn in _context.DbNhanVien on g.NguoiNhanID equals nn.ID into nguoiNhanGroup
                              from nguoiNhan in nguoiNhanGroup.DefaultIfEmpty()
                              where g.ID == request.Id
                              select new {
                                  id = g.ID,
                                  tieuDe = g.TieuDe,
                                  nhanVienID = g.NhanVienID,
                                  noiDung = g.NoiDung,
                                  ngayGui = g.NgayGui,
                                  trangThai = g.TrangThai,
                                  maTraCuu = g.MaTraCuu,
                                  tenNguoiGui = nguoiGui != null ? nguoiGui.TenNhanVien : null,
                                  anhNguoiGui = nguoiGui != null ? nguoiGui.Anh : null,
                                  tenChucDanhNguoiGui = nguoiGui != null ? nguoiGui.TenChucDanh : null,
                                  tenNguoiNhan = nguoiNhan != null ? nguoiNhan.TenNhanVien : null,
                                  anhNguoiNhan = nguoiNhan != null ? nguoiNhan.Anh : null,
                                  tenChucDanhNguoiNhan = nguoiNhan != null ? nguoiNhan.TenChucDanh : null,
                              }).FirstOrDefaultAsync();
            if (gopy == null)
                return NotFound(ApiResponse<string>.Error("Không tìm thấy góp ý"));
            return Ok(ApiResponse<object>.Success(gopy, "Thành công"));
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
                    //NoiDung = EncryptUtil.Decrypt(x.NoiDung),
                    NoiDung = x.NoiDung,
                    NhanVienId = x.NhanVienID,
                    AnDanh = x.AnDanh,
                    CreatedDate = x.NgayGui,
                    GroupID = x.GroupID,
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
            // ✅ Nếu trạng thái hiện tại là "CD" → cập nhật thành "DD"
            var gopyEntity = await _context.GY_GopYs.FindAsync(request.Id);
            if (gopyEntity != null && gopyEntity.TrangThai == "GY_CD" && request.UserID != gopyEntity.NhanVienID) {
                gopyEntity.TrangThai = "GY_DD";
                _context.GY_GopYs.Update(gopyEntity);
                await _context.SaveChangesAsync();
            }

            return Ok(ApiResponse<GopYChiTietDto>.Success(gopy));
        }

        [HttpPost("GetGopYsByNhanVien")]

        [HttpPost("Delete")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete([FromBody] DeleteGopYRequest request) {
            var gopY = await _context.GY_GopYs.FindAsync(request.ID);
            if (gopY == null) {
                return NotFound(ApiResponse<String>.Error("Góp ý không tồn tại trên hệ thống"));
            }
            if (gopY.TrangThai != "GY_CD") {
                return NotFound(ApiResponse<string>.Error("Góp ý này đã được người nhận xem, bạn không thể chỉnh sửa hoặc xoá."));
            }
            if (gopY.NhanVienID != request.UserID) {
                return NotFound(ApiResponse<string>.Error("Chỉ người đã tạo góp ý này mới có thể xoá nó."));
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

        [HttpPost("create-phanhoi_ko_dung")]
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
                // Xử lý danh sách file đính kèm
                if (request.Files != null && request.Files.Any()) {
                    foreach (var f in request.Files) {
                        var fileId = Guid.NewGuid();
                        var relativePath = MoveFileFromTmpToUploads(f.DuongDan);
                        _context.GY_FileDinhKems.Add(new GY_FileDinhKem {
                            ID = fileId,
                            GopYID = request.GopYID,
                            PhanHoiID = phanHoi.ID,
                            TenFile = f.TenFile,
                            DuongDan = relativePath ?? Path.Combine("tmp", f.TenFile).Replace("\\", "/"),
                            NgayTai = DateTime.Now
                        });
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

                var list = (
                    from ph in query
                    join nv in _context.DbNhanVien on ph.NguoiPhanHoiID equals nv.ID into nvJoin
                    from nv in nvJoin.DefaultIfEmpty()
                    orderby ph.NgayPhanHoi descending
                    select new GopYPhanHoiDto {
                        ID = ph.ID,
                        GopYID = ph.GopYID,
                        NoiDung = ph.NoiDung,
                        NgayPhanHoi = ph.NgayPhanHoi,
                        NguoiPhanHoiID = ph.NguoiPhanHoiID,

                        // 👇 Thông tin người phản hồi
                        TenNguoiGui = nv != null ? nv.TenNhanVien : (ph.NguoiPhanHoiID == null ? "Nặc danh" : null),
                        AnhNguoiGui = nv != null ? nv.Anh : null,
                        TenChucDanhNguoiGui = nv != null ? nv.TenChucDanh : null,

                        // 👇 Nếu có bảng file đính kèm phản hồi
                        Files = _context.GY_FileDinhKems
                                .Where(f => f.PhanHoiID == ph.ID)
                                .Select(f => new FileDto {
                                    FileName = f.TenFile,
                                    FileUrl = f.DuongDan
                                }).ToList()
                    }
                ).ToList();

                return Ok(ApiResponse<List<GopYPhanHoiDto>>.Success(list));
            } catch (Exception ex) {
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        [HttpPost("phanhoi/create")]
        public async Task<IActionResult> CreatePhanHoi([FromBody] PhanHoiCreateRequest request) {
            if (request == null || string.IsNullOrWhiteSpace(request.NoiDung))
                return BadRequest(ApiResponse<string>.Error("Nội dung phản hồi không được để trống."));
            using var transaction = await _context.Database.BeginTransactionAsync();
            try {
                var phanHoiId = Guid.NewGuid();
                var phanHoi = new GY_PhanHoi {
                    ID = phanHoiId,
                    GopYID = request.GopYID,
                    NoiDung = request.NoiDung.Trim(),
                    NguoiPhanHoiID = request.NguoiPhanHoiID,
                    NgayPhanHoi = DateTime.Now
                };
                _context.GY_PhanHois.Add(phanHoi);
                await _context.SaveChangesAsync();
                // Nếu có file đính kèm thì xử lý
                if (request.Files != null && request.Files.Any()) {
                    foreach (var f in request.Files) {
                        var fileId = Guid.NewGuid();
                        var relativePath = MoveFileFromTmpToUploads(f.DuongDan);
                        _context.GY_FileDinhKems.Add(new GY_FileDinhKem {
                            ID = fileId,
                            GopYID = request.GopYID,
                            PhanHoiID = phanHoiId,
                            TenFile = f.TenFile,
                            DuongDan = relativePath ?? Path.Combine("tmp", f.TenFile).Replace("\\", "/"),
                            NgayTai = DateTime.Now
                        });
                    }
                    await _context.SaveChangesAsync();
                }
                await transaction.CommitAsync();
                /*var data = new Dictionary<string, string>();
                data["Role"] = "GY";
                data["Type"] = "gy";
                data["ID"] = phanHoi.GopYID.ToString() ?? "";
                data["messageId"] = "";
                var result = _firebaseService.SendNotificationToEmployeesAsync(nguoiNhanID, "Phản hồi", request.NoiDung, data, _firebaseService, _repository);*/
               
                return Ok(ApiResponse<string>.Success("Tạo phản hồi thành công."));
            } catch (Exception ex) {
                await transaction.RollbackAsync();
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        [HttpPost("set-group")]
        public async Task<IActionResult> SetGroupForGopY([FromBody] SetGroupRequest request) {
            if (request == null || request.GopYID == Guid.Empty || request.GroupID == "")
                return BadRequest(ApiResponse<string>.Error("GopYID và GroupID không được để trống."));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try {
                // Lấy phản hồi cần cập nhật
                var gopY = await _context.GY_GopYs.FirstOrDefaultAsync(x => x.ID == request.GopYID);

                if (gopY == null)
                    return NotFound(ApiResponse<string>.Error("Góp ý không tồn tại."));
                // Kiểm tra group có tồn tại không (tùy nhu cầu)
                var group = await _context.GY_Group
                    .FirstOrDefaultAsync(x => x.ID == request.GroupID);
                if (group == null)
                    return NotFound(ApiResponse<string>.Error("Nhóm phân loại không tồn tại."));

                // Cập nhật GroupID
                gopY.GroupID = request.GroupID;

                _context.GY_GopYs.Update(gopY);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(ApiResponse<string>.Success("Gán nhóm thành công."));
            } catch (Exception ex) {
                await transaction.RollbackAsync();
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        [HttpPost("get-groups")]
        public async Task<IActionResult> GetGroups() {
            try {
                var groups = await _context.GY_Group
                    .Select(g => new GroupDto {
                        ID = g.ID,
                        Name = g.Name,
                        UpdateAt = g.UpdateAt,
                    })
                    .ToListAsync();
                return Ok(ApiResponse<List<GroupDto>>.Success(groups));
            } catch (Exception ex) {
                return BadRequest(ApiResponse<string>.Error($"Lỗi: {ex.Message}"));
            }
        }

        //chi dùng khi nội dung CSDL bị mã hoá cần giải mã tất cả
        [HttpPost("DecryptNoiDung")]
        public async Task<IActionResult> DecryptNoiDung() {
            var gopYs = await _context.GY_GopYs.ToListAsync();
            foreach (var item in gopYs) {
                if (!string.IsNullOrEmpty(item.NoiDung)) {
                    // Giải mã
                    item.NoiDung = EncryptUtil.Decrypt(item.NoiDung);
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { status = "success", count = gopYs.Count });
        }

    }

}
