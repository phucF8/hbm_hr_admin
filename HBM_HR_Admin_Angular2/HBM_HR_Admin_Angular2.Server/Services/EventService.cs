using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace HBM_HR_Admin_Angular2.Server.Services
{
    public class EventService
    {
                private const string EventTemplateImagePlaceholder = "{{IMAGE_URL}}";
                private const string EventTemplateTextPlaceholder = "{{TEXT_CONTENT}}";
                private const string DefaultEventHtmlTemplate = @"
<!DOCTYPE html>
<html lang=""vi""><head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
        }
        body {
            background-image: {{IMAGE_URL}};
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .preview-overlay {
            width: 100%;
            height: 100%;
            padding: 20px;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45));
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .preview-content {
            word-break: break-word;
            color: white;
            text-align: center;
            font-size: 16px;
            line-height: 1.5;
            max-width: 90%;
        }
    </style>
</head>
<body>
    <div class=""preview-overlay"">
        <div class=""preview-content"">{{TEXT_CONTENT}}</div>
    </div>
</body>
</html>";

        private readonly ApplicationDbContext _context;
        private readonly ILogger<EventService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly string _publicFileBaseUrl;
                private readonly string _eventHtmlTemplatePath;

        public EventService(
            ApplicationDbContext context,
            ILogger<EventService> logger,
            IWebHostEnvironment environment,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
            var configuredBaseUrl = configuration["AppSettings:PublicFileBaseUrl"];
            _publicFileBaseUrl = string.IsNullOrWhiteSpace(configuredBaseUrl)
                ? "http://localhost:8088"
                : configuredBaseUrl.TrimEnd('/');
            _eventHtmlTemplatePath = Path.Combine(
                _environment.ContentRootPath,
                "Resources",
                "Templates",
                "event-preview-template.html");
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

            try
            {
                // Lấy tất cả event active về memory trước để tránh lỗi SQL conversion
                var activeEvents = await _context.EventPages
                    .Where(e => e.IsActive)
                    .AsNoTracking()
                    .ToListAsync();

                _logger.LogInformation($"Tìm thấy {activeEvents.Count} event đang IsActive = true");

                // Lọc theo thời gian trong memory
                var selectedEvent = activeEvents
                    .Where(e => e.StartTime <= now && (e.EndTime == null || e.EndTime >= now))
                    .OrderByDescending(e => e.Priority)
                    .ThenByDescending(e => e.EndTime ?? DateTime.MaxValue)
                    .ThenBy(e => e.StartTime)
                    .FirstOrDefault();

                if (selectedEvent == null)
                {
                    _logger.LogInformation("Không có event nào trong khoảng thời gian hiện tại");
                    return null;
                }

                _logger.LogInformation($"Event được chọn: {selectedEvent.Title} (Priority: {selectedEvent.Priority}, StartTime: {selectedEvent.StartTime}, EndTime: {selectedEvent.EndTime})");

                return selectedEvent;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi query GetActiveEventAsync: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                throw;
            }
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
        /// Parse HtmlContent để extract uploadedImageUrl và copy file từ tmp sang uploads
        /// </summary>
        public async Task<EventPage> CreateEventAsync(EventPage eventPage)
        {
            eventPage.Id = Guid.NewGuid();

            // Parse HtmlContent và copy file từ tmp sang uploads
            await ProcessImageFromHtmlContentAsync(eventPage.HtmlContent);

            _context.EventPages.Add(eventPage);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Tạo event mới: {eventPage.Title} (ID: {eventPage.Id})");
            return eventPage;
        }

        /// <summary>
        /// Cập nhật event
        /// Parse HtmlContent để extract uploadedImageUrl và copy file từ tmp sang uploads
        /// Xóa ảnh cũ nếu ảnh nền thay đổi
        /// </summary>
        public async Task<EventPage?> UpdateEventAsync(Guid id, EventPage updatedEvent)
        {
            var existingEvent = await _context.EventPages.FindAsync(id);
            if (existingEvent == null)
            {
                _logger.LogWarning($"Không tìm thấy event với ID: {id}");
                return null;
            }

            // Lấy URL ảnh cũ và mới để so sánh
            var oldImageUrl = ExtractImageUrlFromHtmlContent(existingEvent.HtmlContent);
            var newImageUrl = ExtractImageUrlFromHtmlContent(updatedEvent.HtmlContent);

            // Parse HtmlContent và copy file từ tmp sang uploads
            await ProcessImageFromHtmlContentAsync(updatedEvent.HtmlContent);

            // Xóa ảnh cũ nếu ảnh nền thay đổi (và ảnh cũ không phải data URL hoặc absolute URL)
            if (!string.IsNullOrWhiteSpace(oldImageUrl) && 
                !string.Equals(oldImageUrl, newImageUrl, StringComparison.OrdinalIgnoreCase))
            {
                DeleteImageFileByUrl(oldImageUrl);
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
        /// Xóa event và file ảnh tài nguyên tương ứng
        /// </summary>
        public async Task<bool> DeleteEventAsync(Guid id)
        {
            var eventPage = await _context.EventPages.FindAsync(id);
            if (eventPage == null)
            {
                _logger.LogWarning($"Không tìm thấy event với ID: {id}");
                return false;
            }

            // Xóa file ảnh tài nguyên nếu có
            DeleteEventImageFile(eventPage.HtmlContent);

            _context.EventPages.Remove(eventPage);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Xóa event: {eventPage.Title} (ID: {id})");
            return true;
        }

        /// <summary>
        /// Extract image URL từ HtmlContent JSON
        /// </summary>
        private string? ExtractImageUrlFromHtmlContent(string htmlContent)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
            {
                return null;
            }

            try
            {
                using var jsonData = JsonDocument.Parse(htmlContent);
                if (jsonData.RootElement.TryGetProperty("uploadedImageUrl", out var imageUrlElement) &&
                    imageUrlElement.ValueKind == JsonValueKind.String)
                {
                    return imageUrlElement.GetString();
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Xóa file ảnh từ thư mục uploads/ dựa trên HtmlContent JSON
        /// </summary>
        private void DeleteEventImageFile(string htmlContent)
        {
            var imageUrl = ExtractImageUrlFromHtmlContent(htmlContent);
            if (!string.IsNullOrWhiteSpace(imageUrl))
            {
                DeleteImageFileByUrl(imageUrl);
            }
        }

        /// <summary>
        /// Xóa file ảnh từ thư mục uploads/ dựa trên image URL
        /// </summary>
        private void DeleteImageFileByUrl(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return;
            }

            try
            {
                // Bỏ qua data URLs và absolute URLs
                if (imageUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase) ||
                    imageUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                    imageUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                // Lấy tên file (bỏ qua path nếu có)
                var fileName = imageUrl.Replace("\\", "/").Split('/').Last();

                // Xây dựng đường dẫn vật lý đến file
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

                // Xóa file nếu tồn tại
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation($"Đã xóa file ảnh cũ: {filePath}");
                }
                else
                {
                    _logger.LogWarning($"File ảnh không tồn tại: {filePath}");
                }
            }
            catch (Exception ex)
            {
                // Không throw exception để không ảnh hưởng đến việc update/delete event
                _logger.LogWarning($"Không thể xóa file ảnh: {ex.Message}");
            }
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

        /// <summary>
        /// Lưu HTML content ra file trong thư mục wwwroot/events
        /// </summary>
        /// <param name="eventId">ID của event</param>
        /// <param name="htmlContent">Nội dung HTML</param>
        /// <param name="fileName">Tên file (không bao gồm extension)</param>
        /// <returns>Đường dẫn tương đối của file đã tạo</returns>
        public async Task<string> SaveHtmlToFileAsync(Guid eventId, string htmlContent, string fileName)
        {
            try
            {
                // Tạo tên file an toàn (loại bỏ ký tự không hợp lệ)
                var safeFileName = string.Join("_", fileName.Split(Path.GetInvalidFileNameChars()));
                var fileNameWithId = $"{safeFileName}_{eventId}.html";

                // Đường dẫn thư mục events trong wwwroot
                var eventsFolder = Path.Combine(_environment.WebRootPath, "events");

                // Tạo thư mục nếu chưa tồn tại
                if (!Directory.Exists(eventsFolder))
                {
                    Directory.CreateDirectory(eventsFolder);
                    _logger.LogInformation($"Đã tạo thư mục: {eventsFolder}");
                }

                // Đường dẫn file đầy đủ
                var filePath = Path.Combine(eventsFolder, fileNameWithId);

                // Ghi nội dung HTML ra file
                await File.WriteAllTextAsync(filePath, htmlContent);

                _logger.LogInformation($"Đã lưu file HTML: {filePath}");

                // Trả về đường dẫn tương đối để có thể truy cập qua HTTP
                return $"/events/{fileNameWithId}";
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi lưu file HTML: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Parse HtmlContent JSON để extract uploadedImageUrl và copy file từ tmp sang uploads
        /// </summary>
        /// <param name="htmlContent">JSON string chứa uploadedImageUrl và content</param>
        private async Task ProcessImageFromHtmlContentAsync(string htmlContent)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
            {
                return;
            }

            try
            {
                // Parse JSON
                var jsonDoc = JsonDocument.Parse(htmlContent);
                var root = jsonDoc.RootElement;

                // Extract uploadedImageUrl
                if (root.TryGetProperty("uploadedImageUrl", out var uploadedImageUrlElement))
                {
                    var uploadedImageUrl = uploadedImageUrlElement.GetString();
                    
                    if (!string.IsNullOrWhiteSpace(uploadedImageUrl))
                    {
                        // Copy file từ tmp sang uploads
                        await CopyFileFromTmpToUploadsAsync(uploadedImageUrl);
                    }
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning($"Không thể parse HtmlContent JSON: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi xử lý image từ HtmlContent: {ex.Message}");
            }
        }

        /// <summary>
        /// Copy file từ thư mục tmp sang uploads
        /// </summary>
        /// <param name="fileName">Tên file (vd: 5a65a55a-3876-437a-a008-f242519ed62f..jpg.enc)</param>
        private async Task CopyFileFromTmpToUploadsAsync(string fileName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(fileName) ||
                    fileName.StartsWith("data:", StringComparison.OrdinalIgnoreCase) ||
                    fileName.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                    fileName.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                var tmpFolder = Path.Combine(_environment.WebRootPath, "tmp");
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                var normalizedFileName = fileName.Replace("\\", "/").Split('/').Last();

                var sourcePath = Path.Combine(tmpFolder, normalizedFileName);
                var destPath = Path.Combine(uploadsFolder, normalizedFileName);

                // Kiểm tra file tồn tại trong tmp
                if (!File.Exists(sourcePath))
                {
                    _logger.LogWarning($"File không tồn tại trong tmp: {sourcePath}");
                    return;
                }

                // Tạo thư mục uploads nếu chưa tồn tại
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    _logger.LogInformation($"Đã tạo thư mục: {uploadsFolder}");
                }

                // Copy file (overwrite nếu đã tồn tại)
                await Task.Run(() => File.Copy(sourcePath, destPath, overwrite: true));

                _logger.LogInformation($"Đã copy file từ tmp sang uploads: {normalizedFileName}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi copy file {fileName} từ tmp sang uploads: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Generate HTML document từ HtmlContent JSON
        /// </summary>
        /// <param name="htmlContentJson">JSON string chứa uploadedImageUrl và content</param>
        /// <returns>HTML document hoàn chỉnh</returns>
        public string GenerateHtmlFromContent(string htmlContentJson, string? requestBaseUrl = null)
        {
            string imageUrl = "none";
            string textContent = "Nội dung hiển thị sẽ xuất hiện tại đây";
            var textSize = 16;
            var textColor = "#ffffff";
            var isBold = false;
            var isItalic = false;
            var fileBaseUrl = string.IsNullOrWhiteSpace(requestBaseUrl)
                ? _publicFileBaseUrl
                : requestBaseUrl.TrimEnd('/');

            if (!string.IsNullOrWhiteSpace(htmlContentJson))
            {
                try
                {
                    using var jsonDoc = JsonDocument.Parse(htmlContentJson);
                    var root = jsonDoc.RootElement;

                    // Extract uploadedImageUrl
                    if (root.TryGetProperty("uploadedImageUrl", out var uploadedImageUrlElement))
                    {
                        var fileName = uploadedImageUrlElement.GetString();
                        if (!string.IsNullOrWhiteSpace(fileName))
                        {
                            // Check if it's a data URL (base64 for preview)
                            if (fileName.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                            {
                                imageUrl = $"url('{fileName}')";
                            }
                            // Check if it's an absolute HTTP/HTTPS URL
                            else if (Uri.TryCreate(fileName, UriKind.Absolute, out var absoluteUri)
                                && (absoluteUri.Scheme == Uri.UriSchemeHttp || absoluteUri.Scheme == Uri.UriSchemeHttps))
                            {
                                imageUrl = $"url('{absoluteUri}')";
                            }
                            // Otherwise, treat as relative filename
                            else
                            {
                                var normalizedFileName = fileName.Replace("\\", "/").Split('/').Last();
                                imageUrl = $"url('{fileBaseUrl}/uploads/{normalizedFileName}')";
                            }
                        }
                    }

                    // Extract content
                    if (root.TryGetProperty("content", out var contentElement) &&
                        contentElement.ValueKind == JsonValueKind.String)
                    {
                        textContent = FormatTextContent(contentElement.GetString());
                    }

                    textSize = NormalizeTextSize(GetOptionalInt(root, "textSize"));
                    textColor = NormalizeTextColor(GetOptionalString(root, "textColor"));
                    isBold = GetOptionalBoolean(root, "isBold");
                    isItalic = GetOptionalBoolean(root, "isItalic");
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Không thể parse HtmlContent JSON. Sử dụng fallback content gốc.");

                    if (LooksLikeHtmlDocument(htmlContentJson))
                    {
                        return htmlContentJson.Trim();
                    }

                    textContent = FormatTextContent(htmlContentJson);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi generate HTML từ event content");
                }
            }

            var htmlTemplate = GetEventHtmlTemplate();
            var styledTextContent = BuildStyledTextContent(textContent, textSize, textColor, isBold, isItalic);
            return htmlTemplate
                .Replace(EventTemplateImagePlaceholder, imageUrl, StringComparison.Ordinal)
                .Replace(EventTemplateTextPlaceholder, styledTextContent, StringComparison.Ordinal)
                .Trim();
        }

        private string GetEventHtmlTemplate()
        {
            try
            {
                if (File.Exists(_eventHtmlTemplatePath))
                {
                    return File.ReadAllText(_eventHtmlTemplatePath);
                }

                _logger.LogWarning("Không tìm thấy template HTML event tại: {TemplatePath}", _eventHtmlTemplatePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đọc template HTML event từ file: {TemplatePath}", _eventHtmlTemplatePath);
            }

            return DefaultEventHtmlTemplate;
        }

        private static string FormatTextContent(string? textContent)
        {
            if (string.IsNullOrWhiteSpace(textContent))
            {
                return "Nội dung hiển thị sẽ xuất hiện tại đây";
            }

            return System.Net.WebUtility.HtmlEncode(textContent)
                .Replace("\r\n", "<br>", StringComparison.Ordinal)
                .Replace("\n", "<br>", StringComparison.Ordinal);
        }

        private static string BuildStyledTextContent(string textContent, int textSize, string textColor, bool isBold, bool isItalic)
        {
            var fontWeight = isBold ? "700" : "400";
            var fontStyle = isItalic ? "italic" : "normal";

            return $"<span style=\"display: inline-block; width: 100%; font-size: {textSize}px !important; color: {textColor} !important; font-weight: {fontWeight} !important; font-style: {fontStyle} !important;\">{textContent}</span>";
        }

        private static string? GetOptionalString(JsonElement root, string propertyName)
        {
            if (root.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String)
            {
                return property.GetString();
            }

            return null;
        }

        private static int? GetOptionalInt(JsonElement root, string propertyName)
        {
            if (!root.TryGetProperty(propertyName, out var property))
            {
                return null;
            }

            if (property.ValueKind == JsonValueKind.Number && property.TryGetInt32(out var intValue))
            {
                return intValue;
            }

            if (property.ValueKind == JsonValueKind.String && int.TryParse(property.GetString(), out intValue))
            {
                return intValue;
            }

            return null;
        }

        private static bool GetOptionalBoolean(JsonElement root, string propertyName)
        {
            if (!root.TryGetProperty(propertyName, out var property))
            {
                return false;
            }

            return property.ValueKind switch
            {
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.String when bool.TryParse(property.GetString(), out var boolValue) => boolValue,
                _ => false
            };
        }

        private static int NormalizeTextSize(int? textSize)
        {
            if (!textSize.HasValue)
            {
                return 16;
            }

            return Math.Clamp(textSize.Value, 10, 72);
        }

        private static string NormalizeTextColor(string? textColor)
        {
            if (!string.IsNullOrWhiteSpace(textColor) &&
                System.Text.RegularExpressions.Regex.IsMatch(textColor.Trim(), "^#([0-9a-fA-F]{6})$"))
            {
                return textColor.Trim();
            }

            return "#ffffff";
        }

        private static bool LooksLikeHtmlDocument(string value)
        {
            return value.Contains("<html", StringComparison.OrdinalIgnoreCase) ||
                   value.Contains("<!DOCTYPE", StringComparison.OrdinalIgnoreCase);
        }
    }
}
