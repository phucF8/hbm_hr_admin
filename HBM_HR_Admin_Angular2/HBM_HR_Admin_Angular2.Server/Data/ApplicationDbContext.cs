using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<ThongBao> DbThongBao { get; set; }
        public DbSet<NS_NhanVien> NS_NhanViens { get; set; }

        public DbSet<ThongBaoNguoiNhan> DbThongBaoNguoiNhan { get; set; }
        

    }



}
