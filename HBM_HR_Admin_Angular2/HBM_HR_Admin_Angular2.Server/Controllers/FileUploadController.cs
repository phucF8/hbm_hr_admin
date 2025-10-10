using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using HBM_HR_Admin_Angular2.Server.Models.Common;

namespace HBM_HR_Admin_Angular2.Server.Controllers {

    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase {
        private readonly long _maxFileSizeBytes;
        private readonly string[] _allowedExtensions;
        private readonly string _uploadRoot;
        private const string UploadFolderName = "tmp";


        public FileUploadController(IConfiguration config, IWebHostEnvironment env) {
            // config example in appsettings.json -> "FileUpload": { "MaxFileSizeMb": 50, "AllowedExtensions": [".jpg",".png",".pdf"] }
            var section = config.GetSection("FileUpload");
            var maxMb = section.GetValue<long>("MaxFileSizeMb", 50);
            _maxFileSizeBytes = maxMb * 1024 * 1024;
            _allowedExtensions = section.GetSection("AllowedExtensions").Get<string[]>() ?? new[] { ".jpg", ".png", ".pdf", ".docx" };
            _uploadRoot = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), UploadFolderName);
            if (!Directory.Exists(_uploadRoot)) Directory.CreateDirectory(_uploadRoot);
        }

        [HttpPost("upload")]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> UploadSingle(IFormFile file) {
            if (file == null)
                return BadRequest(ApiResponse<object>.Error("No file provided."));
            if (file.Length == 0)
                return BadRequest(ApiResponse<object>.Error("Empty file."));
            if (file.Length > _maxFileSizeBytes)
                return BadRequest(ApiResponse<object>.Error(
                    $"File too large. Max allowed: {_maxFileSizeBytes / (1024 * 1024)} MB."));

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(ext))
                return BadRequest(ApiResponse<object>.Error($"Extension '{ext}' not allowed."));

            var savedFileName = $"{Guid.NewGuid()}{ext}".Replace("\"", string.Empty);
            var savePath = Path.Combine(_uploadRoot, savedFileName);

            // ✅ Ghi file ra đĩa
            await using (var stream = System.IO.File.Create(savePath)) {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/{UploadFolderName}/{savedFileName}";

            // ✅ Tạo object dữ liệu trả về đúng yêu cầu
            var fileInfo = new {
                tenFile = file.FileName,
                url = fileUrl
            };

            // ✅ Trả về theo ApiResponse<T>
            return Ok(ApiResponse<object>.Success(fileInfo, "Tải lên thành công"));
        }


        [HttpPost("upload-multi")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile> files) {
            if (files == null || files.Count == 0) return BadRequest(new { error = "No files provided." });
            var results = new List<object>();
            foreach (var file in files) {
                if (file == null || file.Length == 0) continue;
                if (file.Length > _maxFileSizeBytes) continue;
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(ext)) continue;
                var savedFileName = $"{Guid.NewGuid()}{ext}".Replace("\"", string.Empty);
                var savePath = Path.Combine(_uploadRoot, savedFileName);
                await using (var stream = System.IO.File.Create(savePath)) {
                    await file.CopyToAsync(stream);
                }
                results.Add(new { originalName = file.FileName, storedName = savedFileName, size = file.Length, url = $"/{UploadFolderName}/{savedFileName}" });
            }
            return Ok(results);
        }
    }
}
