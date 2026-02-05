using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.entities
{
    [Table("DWH_ETL_JOB_LOG_Recipients")]
    public class DwhEtlJobLogRecipient
    {
        [Key, Column(Order = 0)]
        public Guid ID { get; set; }

        [Key, Column(Order = 1)]
        public Guid UserId { get; set; }

        public DateTime AssignedAt { get; set; }
    }
}
