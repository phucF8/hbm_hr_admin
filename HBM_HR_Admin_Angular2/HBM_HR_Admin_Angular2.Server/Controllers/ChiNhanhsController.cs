using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;





namespace HBM_HR_Admin_Angular2.Server.Controllers {
    
    [ApiController]
    [Route("api/[controller]")]
    public class ChiNhanhsController : ControllerBase {

        private readonly ApplicationDbContext _context;

        public ChiNhanhsController(ApplicationDbContext context) {
            _context = context;
        }

        // GET: api/ChiNhanhs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DM_ChiNhanh>>> GetChiNhanhs() {
            var list = await _context.DM_ChiNhanhs.ToListAsync();
            return Ok(list);
        }

        [HttpPost("list")]
        public async Task<ActionResult<ApiResponse<List<DM_ChiNhanh>>>> List([FromBody] ChinhanhListRequest filter) {
            try {
                string? idParent = null;

                // Đọc IDParent từ JSON body
                if (filter != null && filter.IDParent != null)
                    idParent = (string?)filter.IDParent;

                var query = _context.DM_ChiNhanhs.AsQueryable();

                // Nếu truyền IDParent => lọc theo IDParent
                if (!string.IsNullOrEmpty(idParent)) {
                    query = query.Where(x => x.IDParent == idParent);
                } else {
                    // Nếu không truyền => lấy chi nhánh gốc (IDParent null hoặc rỗng)
                    query = query.Where(x => x.IDParent == null || x.IDParent == "");
                }

                var list = await query
                    .OrderBy(x => x.TenChiNhanh)
                    .ToListAsync();

                return ApiResponse<List<DM_ChiNhanh>>.Success(list, "Lấy danh sách chi nhánh thành công");
            } catch (Exception ex) {
                return ApiResponse<List<DM_ChiNhanh>>.Error(ex.InnerException?.Message ?? ex.Message);
            }
        }

    }
}
