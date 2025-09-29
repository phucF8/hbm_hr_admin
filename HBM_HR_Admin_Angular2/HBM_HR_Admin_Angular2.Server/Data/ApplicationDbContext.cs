using HBM_HR_Admin_Angular2.Server.Models;
using HBM_HR_Admin_Angular2.Server.Voting.Models;
using Microsoft.EntityFrameworkCore;


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
        public DbSet<BB_UserAnswer> BB_UserAnswers { get; set; }
        public DbSet<BB_TopicRelease> BB_TopicRelease { get; set; }
        public DbSet<DM_ChiNhanh> DM_ChiNhanhs { get; set; }
        public DbSet<GY_GopY> GY_GopYs { get; set; }

        public DbSet<GY_FileDinhKem> GY_Files { get; set; }
    }



}
