using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HBM_HR_Admin_Angular2.Server.Services
{
    public class EventService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EventService> _logger;

        public EventService(ApplicationDbContext context, ILogger<EventService> logger)
        {
            _context = context;
            _logger = logger;
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
            var selectedEvent = await _context.EventPages
                .Where(e => e.IsActive)
                .Where(e => e.StartTime <= now)
                .Where(e => e.EndTime == null || e.EndTime >= now)
                .OrderByDescending(e => e.Priority)
                .ThenByDescending(e => e.EndTime ?? DateTime.MaxValue)
                .ThenBy(e => e.StartTime)
                .FirstOrDefaultAsync();

            if (selectedEvent == null)
            {
                _logger.LogInformation("Không có event nào đang active");
                return null;
            }

            _logger.LogInformation($"Event được chọn: {selectedEvent.Title} (Priority: {selectedEvent.Priority})");

            return selectedEvent;
        }

        /// <summary>
        /// Lấy tất cả events
        /// </summary>
        public async Task<List<EventPage>> GetAllEventsAsync()
        {
            return await _context.EventPages
                .OrderByDescending(e => e.Priority)
                .ThenByDescending(e => e.StartTime)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy event theo ID
        /// </summary>
        public async Task<EventPage?> GetEventByIdAsync(Guid id)
        {
            return await _context.EventPages.FindAsync(id);
        }

        /// <summary>
        /// Tạo event mới
        /// </summary>
        public async Task<EventPage> CreateEventAsync(EventPage eventPage)
        {
            eventPage.Id = Guid.NewGuid();
            _context.EventPages.Add(eventPage);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Tạo event mới: {eventPage.Title} (ID: {eventPage.Id})");
            return eventPage;
        }

        /// <summary>
        /// Cập nhật event
        /// </summary>
        public async Task<EventPage?> UpdateEventAsync(Guid id, EventPage updatedEvent)
        {
            var existingEvent = await _context.EventPages.FindAsync(id);
            if (existingEvent == null)
            {
                _logger.LogWarning($"Không tìm thấy event với ID: {id}");
                return null;
            }

            existingEvent.Title = updatedEvent.Title;
            existingEvent.HtmlContent = updatedEvent.HtmlContent;
            existingEvent.IsActive = updatedEvent.IsActive;
            existingEvent.Version = updatedEvent.Version;
            existingEvent.StartTime = updatedEvent.StartTime;
            existingEvent.EndTime = updatedEvent.EndTime;
            existingEvent.Priority = updatedEvent.Priority;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Cập nhật event: {existingEvent.Title} (ID: {id})");
            return existingEvent;
        }

        /// <summary>
        /// Xóa event
        /// </summary>
        public async Task<bool> DeleteEventAsync(Guid id)
        {
            var eventPage = await _context.EventPages.FindAsync(id);
            if (eventPage == null)
            {
                _logger.LogWarning($"Không tìm thấy event với ID: {id}");
                return false;
            }

            _context.EventPages.Remove(eventPage);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Xóa event: {eventPage.Title} (ID: {id})");
            return true;
        }

        /// <summary>
        /// Toggle trạng thái IsActive
        /// </summary>
        public async Task<EventPage?> ToggleActiveStatusAsync(Guid id)
        {
            var eventPage = await _context.EventPages.FindAsync(id);
            if (eventPage == null)
            {
                _logger.LogWarning($"Không tìm thấy event với ID: {id}");
                return null;
            }

            eventPage.IsActive = !eventPage.IsActive;
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Toggle IsActive của event {eventPage.Title}: {eventPage.IsActive}");
            return eventPage;
        }
    }
}
