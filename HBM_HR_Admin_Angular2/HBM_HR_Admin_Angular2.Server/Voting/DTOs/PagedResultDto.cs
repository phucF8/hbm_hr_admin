namespace HBM_HR_Admin_Angular2.Server.Voting.DTOs
{
    public class PagedResultDto<T>
    {
        public int TotalItems { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<T> Items { get; set; } = new List<T>();
    }

}
