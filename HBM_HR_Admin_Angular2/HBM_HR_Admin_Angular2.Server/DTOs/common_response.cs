namespace HBM_HR_Admin_Angular2.Server.DTOs {
    public class PagedResult<T> {
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public List<T> items { get; set; }
    }
}
