using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HBM_HR_Admin_Angular2.Server.Controllers {

    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase {
        private readonly long _maxFileSizeBytes;
        private readonly string[] _allowedExtensions;
        private readonly string _uploadRoot,_uploadPublic;
        private const string UploadFolderName = "tmp";

        private const string UploadPublicFolderName = "uploads";


        public FileUploadController(IConfiguration config, IWebHostEnvironment env) {
            // config example in appsettings.json -> "FileUpload": { "MaxFileSizeMb": 50, "AllowedExtensions": [".jpg",".png",".pdf"] }
            var section = config.GetSection("FileUpload");
            var maxMb = section.GetValue<long>("MaxFileSizeMb", 50);
            _maxFileSizeBytes = maxMb * 1024 * 1024;
            _allowedExtensions = section.GetSection("AllowedExtensions").Get<string[]>() ?? new[] { ".jpg", ".png", ".pdf", ".docx" };
            _uploadRoot = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), UploadFolderName);
            if (!Directory.Exists(_uploadRoot)) Directory.CreateDirectory(_uploadRoot);
            _uploadPublic = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), UploadPublicFolderName);
            if (!Directory.Exists(_uploadPublic)) Directory.CreateDirectory(_uploadPublic);
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

            var savedFileName = $"{Guid.NewGuid()}.{ext}".Replace("\"", string.Empty);
            var savePath = Path.Combine(_uploadRoot, savedFileName);

            string originalFilePath = Path.Combine(_uploadRoot, savedFileName);
            //string encryptedFileName = $"{Path.GetFileNameWithoutExtension(savedFileName)}.enc";
            string encryptedFileName = $"{savedFileName}.enc";
            string encryptedFilePath = Path.Combine(_uploadRoot, encryptedFileName);

            // 1️.Lưu file gốc tạm
            using (var stream = new FileStream(originalFilePath, FileMode.Create)) {
                await file.CopyToAsync(stream);
            }

            // 2️.Mã hoá file
            await EncryptUtil.EncryptFileAsync(originalFilePath, encryptedFilePath);

            // 3️.Xoá file gốc sau khi mã hoá
            System.IO.File.Delete(originalFilePath);

            //// ✅ Ghi file ra đĩa
            //await using (var stream = System.IO.File.Create(savePath)) {
            //    await file.CopyToAsync(stream);
            //}

            //var fileUrl = $"/{UploadFolderName}/{savedFileName}";
            var fileUrl = $"/{UploadFolderName}/{encryptedFileName}";

            // ✅ Tạo object dữ liệu trả về đúng yêu cầu
            var fileInfo = new {
                tenFile = file.FileName,
                url = fileUrl
            };

            // ✅ Trả về theo ApiResponse<T>
            return Ok(ApiResponse<object>.Success(fileInfo, "Tải lên thành công"));
        }

        [AllowAnonymous]
        [HttpGet("ViewFile")]
        public async Task<IActionResult> ViewFile(string fileName) {
            string encryptedPath = Path.Combine(_uploadPublic, fileName);

            if (!System.IO.File.Exists(encryptedPath))
                return NotFound();

            // Tạo file tạm để chứa file đã giải mã
            string tempFile = Path.GetTempFileName();

            try {
                await EncryptUtil.DecryptFileAsync(encryptedPath, tempFile);

                await using var memoryStream = new MemoryStream(await System.IO.File.ReadAllBytesAsync(tempFile));
                memoryStream.Position = 0;

                string originalExt = Path.GetExtension(fileName.Replace(".enc", "")).ToLower();
                string contentType = originalExt switch {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".pdf" => "application/pdf",
                    _ => "application/octet-stream"
                };

                return File(memoryStream.ToArray(), contentType);
            } finally {
                // Xóa file tạm
                if (System.IO.File.Exists(tempFile))
                    System.IO.File.Delete(tempFile);
            }
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
