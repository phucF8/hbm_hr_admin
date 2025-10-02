using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;

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
        [RequestSizeLimit(long.MaxValue)] // rely on config-based limits; you can remove or adjust
        public async Task<IActionResult> UploadSingle(IFormFile file) {
            if (file == null) return BadRequest(new { error = "No file provided." });
            if (file.Length == 0) return BadRequest(new { error = "Empty file." });
            if (file.Length > _maxFileSizeBytes) {
                return BadRequest(new { error = $"File too large. Max allowed: {_maxFileSizeBytes / (1024 * 1024)} MB." });
            }
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(ext)) {
                return BadRequest(new { error = $"Extension '{ext}' not allowed." });
            }
            var savedFileName = $"{Guid.NewGuid()}{ext}".Replace("\"", string.Empty);
            var savePath = Path.Combine(_uploadRoot, savedFileName);
            // Stream to disk to avoid buffering whole file in memory
            await using (var stream = System.IO.File.Create(savePath)) {
                await file.CopyToAsync(stream);
            }
            var fileUrl = $"/{UploadFolderName}/{savedFileName}"; // assuming static files served from wwwroot
            return Ok(new {
            originalName = file.FileName,
                storedName = savedFileName,
                size = file.Length,
                url = fileUrl
            });
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
