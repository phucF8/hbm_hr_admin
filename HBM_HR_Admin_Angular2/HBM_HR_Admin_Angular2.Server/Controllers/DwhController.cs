using Dapper;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.DTOs;
using HBM_HR_Admin_Angular2.Server.DTOs.Dwh;
using HBM_HR_Admin_Angular2.Server.entities;
using HBM_HR_Admin_Angular2.Server.Filters;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Repositories;
using HBM_HR_Admin_Angular2.Server.Services;
using LinqToDB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/dwh")]
    [ServiceFilter(typeof(DwhAppTokenFilter))]
    public class DwhController : ControllerBase {
        
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly string _connectionString;


        private readonly FirebaseNotificationService _firebaseService;
        private readonly NotificationRepository _repository;
        private readonly NotificationService _notificationService;

        private readonly IDebugRepository _debugRepository;


        public DwhController(ApplicationDbContext db,
            FirebaseNotificationService firebaseService,
            NotificationRepository repository,
            NotificationService notificationService,
            IDebugRepository debugRepository,
            IConfiguration config){
            _db = db;
            _debugRepository = debugRepository;
            _config = config;
            _connectionString = _config.GetConnectionString("DefaultConnection");
            _notificationService = notificationService;
            _firebaseService = firebaseService;
            _repository = repository;
        }

        [HttpPost("etl/job-log")]
        public async Task<ApiResponse<bool>> EtlJobLog(
        [FromBody] CreateEtlJobLogRequest model) {
            if (!ModelState.IsValid) {
                return ApiResponse<bool>.Error("Thiếu hoặc sai dữ liệu bắt buộc (logDate, jobName, idJob)");
            }
            if (model.LogDate == default) {
                return ApiResponse<bool>.Error("Thiếu logDate");
            }
            try {
                var entity = new DwhEtlJobLog {
                    ID_JOB = model.ID_JOB,
                    JOBNAME = model.JobName,
                    LOGDATE = model.LogDate,
                    ERRORS = model.Errors,
                    LOG_FIELD = model.LogField,
                    CREATED_AT = DateTime.Now
                };

                await _db.DwhEtlJobLog.AddAsync(entity);
                await _db.SaveChangesAsync();

                // ===============================
                // ✅ PUSH NOTIFICATION
                // ===============================

                var title = "Hệ thống Data Warehouse gặp lỗi xử lý dữ liệu";
                var body = $"Quá trình xử lý dữ liệu Data Warehouse: " +
                    $"{model.JobName}," + 
                    $"ngày {model.LogDate:dd/MM/yyyy HH:mm:ss} đã xảy ra lỗi.";

                var data = new Dictionary<string, string> {
                    ["Role"] = "ETL",
                    ["Type"] = "DWH_LOG",
                    ["ID"] = entity.ID.ToString(),
                    ["JobName"] = model.JobName,
                    ["LogDate"] = model.LogDate.ToString("O")
                };


                String username = "phucnh@hbm.vn";
                var nhanVien = await _debugRepository.GetNhanVienByUsernameAsync(username);


                // Ví dụ: gửi cho admin / IT / DWH team
                var receivers = new List<string> {
                    nhanVien.ID,
                };

                await _notificationService.CreateThongBaoDwhLogAsync(
                    entity.ID,       // ID thông báo
                    title,
                    "SYSTEM",             // người gửi
                    receivers
                );

                await _firebaseService.SendNotificationToEmployeesAsync(
                    string.Join(",", receivers),
                    title,
                    body,
                    data,
                    _firebaseService,
                    _repository
                );

                return ApiResponse<bool>.Success(true);
            } catch (Exception ex) {
                return ApiResponse<bool>.Error(
                    ex.InnerException?.Message ?? ex.Message
                );
            }
        }

        Guid LongToGuid(long value) {
            var bytes = new byte[16];
            BitConverter.GetBytes(value).CopyTo(bytes, 0);
            return new Guid(bytes);
        }


        [HttpPost("etl/job-log/detail")]
        public async Task<IActionResult> GetEtlJobLogDetail(
        [FromBody] DwhLogChiTietRequest request) {
            if (request == null) {
                return BadRequest(
                    ApiResponse<DwhEtlJobLogChiTietDto>.Error("Id không hợp lệ.")
                );
            }

            var log = await _db.DwhEtlJobLog
                .Where(x => x.ID == request.Id)
                .Select(x => new DwhEtlJobLogChiTietDto {
                    Id = x.ID,
                    IdJob = x.ID_JOB,
                    JobName = x.JOBNAME,
                    LogDate = x.LOGDATE,
                    Errors = x.ERRORS,
                    LogField = x.LOG_FIELD,
                    CreatedAt = x.CREATED_AT
                })
                .FirstOrDefaultAsync();

            if (log == null) {
                return NotFound(
                    ApiResponse<DwhEtlJobLogChiTietDto>.Error(
                        "Không tìm thấy thông tin chi tiết xử lý dữ liệu."
                    )
                );
            }

            return Ok(
                ApiResponse<DwhEtlJobLogChiTietDto>.Success(log)
            );
        }

        [HttpPost("etl/job-log/list")]
        public async Task<IActionResult> GetEtlJobLogList([FromBody] DwhLogListRequest request) {
            if (request == null) return BadRequest(ApiResponse<string>.Error("Request không hợp lệ"));
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 20;
    
            var query = _db.DwhEtlJobLog.AsQueryable();
    
            if (request.IdJob.HasValue) query = query.Where(x => x.ID_JOB == request.IdJob.Value);
            if (request.FromDate.HasValue) query = query.Where(x => x.LOGDATE >= request.FromDate.Value);
            if (request.ToDate.HasValue) query = query.Where(x => x.LOGDATE <= request.ToDate.Value);
            if (!string.IsNullOrWhiteSpace(request.Search)) {
                var s = request.Search.Trim();
                query = query.Where(x => x.JOBNAME.Contains(s) || x.LOG_FIELD.Contains(s));
            }
    
            var total = await query.LongCountAsync();
    
            var items = await query
                .OrderByDescending(x => x.LOGDATE)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new DwhEtlJobLogDto {
                    Id = x.ID,
                    IdJob = x.ID_JOB,
                    JobName = x.JOBNAME,
                    LogDate = x.LOGDATE,
                    Errors = x.ERRORS,
                    LogField = x.LOG_FIELD,
                    CreatedAt = x.CREATED_AT
                })
                .ToListAsync();
    
            var result = new PagedResult<DwhEtlJobLogDto> {
                TotalCount = (int)total,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                items = items
            };
    
            return Ok(ApiResponse<object>.Success(result));
        }


    }


}

