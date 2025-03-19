using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Notification> NS_ADTB_Notifications { get; set; }
    }

    

}
