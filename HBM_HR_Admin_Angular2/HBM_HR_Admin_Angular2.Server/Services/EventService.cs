using HBM_HR_Admin_Angular2.Server.Models;

namespace HBM_HR_Admin_Angular2.Server.Services
{
    public class EventService
    {
        private readonly ILogger<EventService> _logger;

        // Mock data để test logic
        private readonly List<EventPage> _mockEvents;

        public EventService(ILogger<EventService> logger)
        {
            _logger = logger;

            // Khởi tạo mock data
            _mockEvents = new List<EventPage>
            {
                new EventPage
                {
                    Id = Guid.NewGuid(),
                    Title = "Tết Nguyên Đán 2026",
                    HtmlContent = "<h1>Chúc mừng năm mới!</h1>",
                    IsActive = true,
                    Version = 1,
                    StartTime = new DateTime(2026, 1, 25),
                    EndTime = new DateTime(2026, 2, 5),
                    Priority = 10
                },
                new EventPage
                {
                    Id = Guid.NewGuid(),
                    Title = "Khuyến mãi Tháng 3",
                    HtmlContent = "<h1>Giảm giá 20%</h1>",
                    IsActive = true,
                    Version = 1,
                    StartTime = new DateTime(2026, 3, 1),
                    EndTime = new DateTime(2026, 3, 31),
                    Priority = 5
                },
                new EventPage
                {
                    Id = Guid.NewGuid(),
                    Title = "Event Ưu tiên cao - Test",
                    HtmlContent = "<h1>Event có priority cao nhất</h1>",
                    IsActive = true,
                    Version = 1,
                    StartTime = new DateTime(2026, 3, 1),
                    EndTime = new DateTime(2026, 3, 15),
                    Priority = 20
                },
                new EventPage
                {
                    Id = Guid.NewGuid(),
                    Title = "Event đã hết hạn",
                    HtmlContent = "<h1>Event cũ</h1>",
                    IsActive = true,
                    Version = 1,
                    StartTime = new DateTime(2025, 12, 1),
                    EndTime = new DateTime(2025, 12, 31),
                    Priority = 15
                },
                new EventPage
                {
                    Id = Guid.NewGuid(),
                    Title = "Event tương lai",
                    HtmlContent = "<h1>Event chưa đến</h1>",
                    IsActive = true,
                    Version = 1,
                    StartTime = new DateTime(2026, 4, 1),
                    EndTime = new DateTime(2026, 4, 30),
                    Priority = 8
                }
            };
        }

        /// <summary>
        /// Lấy event đang active theo thời gian hiện tại.
        /// Ưu tiên event có Priority cao nhất nếu có nhiều event hợp lệ.
        /// </summary>
        /// <returns>EventPage đang active hoặc null nếu không có</returns>
        public async Task<EventPage?> GetActiveEventAsync()
        {
            var now = DateTime.Now;

            _logger.LogInformation($"Tìm event active tại thời điểm: {now}");

            // Lọc các event hợp lệ:
            // - IsActive = true
            // - StartTime <= now <= EndTime (hoặc EndTime = null)
            var activeEvents = _mockEvents
                .Where(e => e.IsActive)
                .Where(e => e.StartTime <= now)
                .Where(e => e.EndTime == null || e.EndTime >= now)
                .ToList();

            if (!activeEvents.Any())
            {
                _logger.LogInformation("Không có event nào đang active");
                return null;
            }

            // Chọn event có Priority cao nhất
            var selectedEvent = activeEvents
                .OrderByDescending(e => e.Priority)
                .FirstOrDefault();

            _logger.LogInformation($"Event được chọn: {selectedEvent?.Title} (Priority: {selectedEvent?.Priority})");

            // Simulate async operation
            return await Task.FromResult(selectedEvent);
        }
    }
}
