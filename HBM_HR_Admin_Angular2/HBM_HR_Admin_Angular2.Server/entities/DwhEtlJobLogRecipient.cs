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
        public string IDuser { get; set; } // varchar(36)

        public DateTime AssignedAt { get; set; }
    }
}
