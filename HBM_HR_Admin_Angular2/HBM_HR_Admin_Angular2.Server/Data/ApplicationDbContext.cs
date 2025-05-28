using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Notification> V_ThongBao { get; set; }

        public DbSet<Notification> NS_ADTB_Notifications { get; set; }

        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //    // View không có khóa chính => cần cấu hình NoKey
        //    modelBuilder.Entity<NotificationRecipientView>()
        //        .HasNoKey()
        //        .ToView("v_NotificationsWithRecipients"); // tên view trong SQL

        //    base.OnModelCreating(modelBuilder);
        //}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Notification>()
                .HasMany(n => n.lsV_NhanThongBao)
                .WithOne(r => r.Notification)
                .HasForeignKey(r => r.IDThongBao)
                .HasPrincipalKey(n => n.ID);
        }

    }



}
