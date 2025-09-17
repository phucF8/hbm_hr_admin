using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.EntityFrameworkCore;





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

    }
}
