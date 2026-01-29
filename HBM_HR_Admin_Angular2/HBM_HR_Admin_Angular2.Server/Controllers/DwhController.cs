using Dapper;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.DTOs.Dwh;
using HBM_HR_Admin_Angular2.Server.entities;
using HBM_HR_Admin_Angular2.Server.Filters;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    [ApiController]
    [Route("api/dwh")]
    [ServiceFilter(typeof(DwhAppTokenFilter))]
    public class DwhController : ControllerBase {
        
        private readonly ApplicationDbContext _db;

        public DwhController(ApplicationDbContext db) {
            _db = db;
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

                return ApiResponse<bool>.Success(true);
            } catch (Exception ex) {
                return ApiResponse<bool>.Error(
                    ex.InnerException?.Message ?? ex.Message
                );
            }
        }



    }


}

