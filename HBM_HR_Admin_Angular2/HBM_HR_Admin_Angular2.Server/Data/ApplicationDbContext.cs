using HBM_HR_Admin_Angular2.Server.entities;
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

        // Voting entities
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<BB_UserAnswer> BB_UserAnswers { get; set; }
        public DbSet<BB_TopicRelease> BB_TopicRelease { get; set; }
        public DbSet<DM_ChiNhanh> DM_ChiNhanhs { get; set; }
        public DbSet<GY_GopY> GY_GopYs { get; set; }
        public DbSet<GY_Group> GY_Group { get; set; }

        public DbSet<GY_FileDinhKem> GY_FileDinhKems { get; set; }
        public DbSet<GY_PhanHoi> GY_PhanHois { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            // File đính kèm có thể thuộc Góp ý
            modelBuilder.Entity<GY_FileDinhKem>()
                .HasOne(f => f.GopY)
                .WithMany(g => g.Files)
                .HasForeignKey(f => f.GopYID)
                .OnDelete(DeleteBehavior.Restrict); // tránh cascade conflict

            // File đính kèm có thể thuộc Phản hồi
            modelBuilder.Entity<GY_FileDinhKem>()
                .HasOne(f => f.PhanHoi)
                .WithMany(p => p.FileDinhKems)
                .HasForeignKey(f => f.PhanHoiID)
                .OnDelete(DeleteBehavior.Restrict);

            // DWH_NOTIFICATION_RECIPIENTS primary key
            modelBuilder.Entity<DwhNotificationRecipient>()
                .HasKey(x => x.IDuser)
                .HasName("PK_DWH_NOTIFICATION_RECIPIENTS");

            base.OnModelCreating(modelBuilder);
        }


        public DbSet<AD_ThongBao> AD_ThongBao { get; set; }
        public DbSet<AD_ThongBao_NguoiNhan> AD_ThongBao_NguoiNhan { get; set; }
        public DbSet<NV_NhacViec> NV_NhacViec { get; set; }

        public DbSet<NS_NhanVien_DeviceTokens> NS_NhanVien_DeviceTokens { get; set; }
        public DbSet<NV_LoaiCongViec> NV_LoaiCongViec { get; set; }


        // Data Warehouse
        public DbSet<DwhEtlJobLog> DwhEtlJobLogs { get; set; }
        public DbSet<DwhNotificationRecipient> DwhNotificationRecipients { get; set; }

    }



}
