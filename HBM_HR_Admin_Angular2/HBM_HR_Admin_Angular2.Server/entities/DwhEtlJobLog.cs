using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.entities {

    [Table("DWH_ETL_JOB_LOG")]
    public class DwhEtlJobLog {
        public Guid ID { get; set; }
        public int ID_JOB { get; set; }
        public string JOBNAME { get; set; }
        public DateTime LOGDATE { get; set; }
        public int ERRORS { get; set; }
        public string LOG_FIELD { get; set; }
        public DateTime CREATED_AT { get; set; }
    }

}