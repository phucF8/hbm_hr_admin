using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.entities
{
    [Table("DWH_NOTIFICATION_RECIPIENTS")]
    public class DwhNotificationRecipient
    {
        [Key]
        [Column("IDuser")]
        public String IDuser { get; set; }

        public DateTime AssignedAt { get; set; }
    }
}
