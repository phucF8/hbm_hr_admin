namespace HBM_HR_Admin_Angular2.Server.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using System.Collections.Generic;

    [Route("api/thongbao")]
    [ApiController]
    public class ThongBaoController : ControllerBase
    {
        private static List<ThongBao> _thongBaoList = new List<ThongBao>
        {
            new ThongBao { Id = 1, TieuDe = "Thông báo 1", NoiDung = "Nội dung 1", NgayTao = DateTime.Now },
            new ThongBao { Id = 2, TieuDe = "Thông báo 2", NoiDung = "Nội dung 2", NgayTao = DateTime.Now }
        };

        [HttpGet]
        public IActionResult GetThongBao()
        {
            return Ok(_thongBaoList);
        }
    }

}
