using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<ThongBao> DbThongBao { get; set; }
        public DbSet<NS_NhanVien> DbNhanVien { get; set; }

        public DbSet<UserErrorReport> DbUserErrorReport { get; set; }

        public DbSet<ThongBaoNguoiNhan> DbThongBaoNguoiNhan { get; set; }

        public DbSet<Topic> Topics { get; set; }

        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }





    }



}
