namespace HBM_HR_Admin_Angular2.Server.DTOs.Dwh
{
    public class AssignEtlJobLogRecipientsRequest
    {
        public Guid JobLogId { get; set; }           // ID của DWH_ETL_JOB_LOG
        public List<Guid> UserIds { get; set; }      // Danh sách UserId nhận thông báo
    }



}
