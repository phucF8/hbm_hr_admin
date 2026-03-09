using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<FileUploadController> _logger;
        private const string UploadFolderName = "tmp";

        private const string UploadPublicFolderName = "uploads";


        public FileUploadController(IConfiguration config, IWebHostEnvironment env, ILogger<FileUploadController> logger) {
            _logger = logger;
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
            try {
                if (file == null) {
                    _logger.LogWarning("❌ Upload failed: No file provided");
                    return BadRequest(ApiResponse<object>.Error("No file provided."));
                }

                _logger.LogInformation($"📤 Upload started: {file.FileName} (Size: {file.Length} bytes)");

                if (file.Length == 0) {
                    _logger.LogWarning($"❌ Upload failed: File is empty - {file.FileName}");
                    return BadRequest(ApiResponse<object>.Error("Empty file."));
                }

                if (file.Length > _maxFileSizeBytes) {
                    var maxMb = _maxFileSizeBytes / (1024 * 1024);
                    _logger.LogWarning($"❌ Upload failed: File too large - {file.FileName} ({file.Length} bytes > {_maxFileSizeBytes} bytes)");
                    return BadRequest(ApiResponse<object>.Error(
                        $"File too large. Max allowed: {maxMb} MB."));
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(ext)) {
                    _logger.LogWarning($"❌ Upload failed: Extension not allowed - {file.FileName} (ext: {ext})");
                    return BadRequest(ApiResponse<object>.Error($"Extension '{ext}' not allowed."));
                }

                var savedFileName = $"{Guid.NewGuid()}.{ext}".Replace("\"", string.Empty);
                var savePath = Path.Combine(_uploadRoot, savedFileName);

                string originalFilePath = Path.Combine(_uploadRoot, savedFileName);
                string encryptedFileName = $"{savedFileName}.enc";
                string encryptedFilePath = Path.Combine(_uploadRoot, encryptedFileName);

                _logger.LogInformation($"📝 Step 1: Saving original file to {originalFilePath}");

                // 1️⃣ Lưu file gốc tạm
                using (var stream = new FileStream(originalFilePath, FileMode.Create)) {
                    await file.CopyToAsync(stream);
                }
                _logger.LogInformation($"✅ Original file saved successfully");

                // 2️⃣ Mã hoá file
                _logger.LogInformation($"🔐 Step 2: Encrypting file to {encryptedFilePath}");
                await EncryptUtil.EncryptFileAsync(originalFilePath, encryptedFilePath);
                _logger.LogInformation($"✅ File encrypted successfully");

                // 3️⃣ Xoá file gốc sau khi mã hoá
                _logger.LogInformation($"🗑️ Step 3: Cleaning up original file");
                System.IO.File.Delete(originalFilePath);
                _logger.LogInformation($"✅ Original file deleted");

                var fileUrl = $"/{UploadFolderName}/{encryptedFileName}";
                var filePath = encryptedFilePath;

                // ✅ Tạo object dữ liệu trả về đúng yêu cầu
                var fileInfo = new {
                    tenFile = file.FileName,
                    url = fileUrl,
                    filePath = filePath,
                    encryptedFileName = encryptedFileName,
                    originalSize = file.Length
                };

                _logger.LogInformation($"✅ Upload completed successfully - File: {file.FileName}, URL: {fileUrl}, Saved At: {filePath}");

                // ✅ Trả về theo ApiResponse<T>
                return Ok(ApiResponse<object>.Success(fileInfo, "Tải lên thành công"));
            } catch (IOException ex) {
                _logger.LogError(ex, $"❌ Upload failed: IO Error for file {file?.FileName}");
                return StatusCode(500, ApiResponse<object>.Error($"File write error: {ex.Message}"));
            } catch (Exception ex) {
                _logger.LogError(ex, $"❌ Upload failed: Unexpected error for file {file?.FileName}");
                return StatusCode(500, ApiResponse<object>.Error($"Upload failed: {ex.Message}"));
            }
        }

        /// <summary>
        /// POST /api/fileupload/upload-unencrypted - Upload file không mã hóa lên thư mục tmp
        /// Giữ nguyên phần mở rộng file
        /// </summary>
        [HttpPost("upload-unencrypted")]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> UploadUnencrypted(IFormFile file) {
            try {
                if (file == null) {
                    _logger.LogWarning("❌ Upload (unencrypted) failed: No file provided");
                    return BadRequest(ApiResponse<object>.Error("No file provided."));
                }

                _logger.LogInformation($"📤 Upload (unencrypted) started: {file.FileName} (Size: {file.Length} bytes)");

                if (file.Length == 0) {
                    _logger.LogWarning($"❌ Upload (unencrypted) failed: File is empty - {file.FileName}");
                    return BadRequest(ApiResponse<object>.Error("Empty file."));
                }

                if (file.Length > _maxFileSizeBytes) {
                    var maxMb = _maxFileSizeBytes / (1024 * 1024);
                    _logger.LogWarning($"❌ Upload (unencrypted) failed: File too large - {file.FileName} ({file.Length} bytes > {_maxFileSizeBytes} bytes)");
                    return BadRequest(ApiResponse<object>.Error(
                        $"File too large. Max allowed: {maxMb} MB."));
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(ext)) {
                    _logger.LogWarning($"❌ Upload (unencrypted) failed: Extension not allowed - {file.FileName} (ext: {ext})");
                    return BadRequest(ApiResponse<object>.Error($"Extension '{ext}' not allowed."));
                }

                // Tạo tên file: GUID + extension (không thêm .enc)
                var savedFileName = $"{Guid.NewGuid()}{ext}".Replace("\"", string.Empty);
                var filePath = Path.Combine(_uploadRoot, savedFileName);

                _logger.LogInformation($"📝 Saving file to {filePath}");

                // Lưu file trực tiếp không mã hóa
                using (var stream = new FileStream(filePath, FileMode.Create)) {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"✅ File saved successfully (unencrypted)");

                var fileUrl = $"/{UploadFolderName}/{savedFileName}";

                // Tạo object dữ liệu trả về
                var fileInfo = new {
                    tenFile = file.FileName,
                    url = fileUrl,
                    filePath = filePath,
                    fileName = savedFileName,
                    originalSize = file.Length
                };

                _logger.LogInformation($"✅ Upload (unencrypted) completed successfully - File: {file.FileName}, URL: {fileUrl}, Saved At: {filePath}");

                return Ok(ApiResponse<object>.Success(fileInfo, "Tải lên thành công"));
            } catch (IOException ex) {
                _logger.LogError(ex, $"❌ Upload (unencrypted) failed: IO Error for file {file?.FileName}");
                return StatusCode(500, ApiResponse<object>.Error($"File write error: {ex.Message}"));
            } catch (Exception ex) {
                _logger.LogError(ex, $"❌ Upload (unencrypted) failed: Unexpected error for file {file?.FileName}");
                return StatusCode(500, ApiResponse<object>.Error($"Upload failed: {ex.Message}"));
            }
        }

        [HttpPost("upload-public")]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> UploadSingleToUploads(IFormFile file) {
            try {
                if (file == null) {
                    _logger.LogWarning("❌ Upload (uploads) failed: No file provided");
                    return BadRequest(ApiResponse<object>.Error("No file provided."));
                }

                _logger.LogInformation($"📤 Upload (uploads) started: {file.FileName} (Size: {file.Length} bytes)");

                if (file.Length == 0) {
                    _logger.LogWarning($"❌ Upload (uploads) failed: File is empty - {file.FileName}");
                    return BadRequest(ApiResponse<object>.Error("Empty file."));
                }

                if (file.Length > _maxFileSizeBytes) {
                    var maxMb = _maxFileSizeBytes / (1024 * 1024);
                    _logger.LogWarning($"❌ Upload (uploads) failed: File too large - {file.FileName} ({file.Length} bytes > {_maxFileSizeBytes} bytes)");
                    return BadRequest(ApiResponse<object>.Error(
                        $"File too large. Max allowed: {maxMb} MB."));
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(ext)) {
                    _logger.LogWarning($"❌ Upload (uploads) failed: Extension not allowed - {file.FileName} (ext: {ext})");
                    return BadRequest(ApiResponse<object>.Error($"Extension '{ext}' not allowed."));
                }

                var savedFileName = $"{Guid.NewGuid()}{ext}".Replace("\"", string.Empty);

                string originalFilePath = Path.Combine(_uploadPublic, savedFileName);
                string encryptedFileName = $"{savedFileName}.enc";
                string encryptedFilePath = Path.Combine(_uploadPublic, encryptedFileName);

                _logger.LogInformation($"📝 Step 1 (uploads): Saving original file to {originalFilePath}");

                using (var stream = new FileStream(originalFilePath, FileMode.Create)) {
                    await file.CopyToAsync(stream);
                }
                _logger.LogInformation("✅ Original file (uploads) saved successfully");

                _logger.LogInformation($"🔐 Step 2 (uploads): Encrypting file to {encryptedFilePath}");
                await EncryptUtil.EncryptFileAsync(originalFilePath, encryptedFilePath);
                _logger.LogInformation("✅ File (uploads) encrypted successfully");

                _logger.LogInformation("🗑️ Step 3 (uploads): Cleaning up original file");
                System.IO.File.Delete(originalFilePath);
                _logger.LogInformation("✅ Original file (uploads) deleted");

                var fileUrl = $"/{UploadPublicFolderName}/{encryptedFileName}";
                var filePath = encryptedFilePath;

                var fileInfo = new {
                    tenFile = file.FileName,
                    url = fileUrl,
                    filePath = filePath,
                    encryptedFileName = encryptedFileName,
                    originalSize = file.Length
                };

                _logger.LogInformation($"✅ Upload (uploads) completed successfully - File: {file.FileName}, URL: {fileUrl}, Saved At: {filePath}");

                return Ok(ApiResponse<object>.Success(fileInfo, "Tải lên thành công"));
            } catch (IOException ex) {
                _logger.LogError(ex, $"❌ Upload (uploads) failed: IO Error for file {file?.FileName}");
                return StatusCode(500, ApiResponse<object>.Error($"File write error: {ex.Message}"));
            } catch (Exception ex) {
                _logger.LogError(ex, $"❌ Upload (uploads) failed: Unexpected error for file {file?.FileName}");
                return StatusCode(500, ApiResponse<object>.Error($"Upload failed: {ex.Message}"));
            }
        }

        [AllowAnonymous]
        [HttpGet("ViewFile")]
        public async Task<IActionResult> ViewFile(string fileName) {
            try {
                _logger.LogInformation($"📥 Download started: {fileName}");

                string encryptedPath = Path.Combine(_uploadPublic, fileName);

                if (!System.IO.File.Exists(encryptedPath)) {
                    _logger.LogWarning($"❌ Download failed: File not found - {fileName} at {encryptedPath}");
                    return NotFound();
                }

                _logger.LogInformation($"🔐 Decrypting file: {fileName}");

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

                    _logger.LogInformation($"✅ Download completed successfully - File: {fileName}, Size: {memoryStream.Length} bytes, ContentType: {contentType}");

                    return File(memoryStream.ToArray(), contentType);
                } finally {
                    // Xóa file tạm
                    if (System.IO.File.Exists(tempFile))
                        System.IO.File.Delete(tempFile);
                }
            } catch (Exception ex) {
                _logger.LogError(ex, $"❌ Download failed: Error reading {fileName}");
                return StatusCode(500);
            }
        }



        [HttpPost("upload-multi")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile> files) {
            try {
                if (files == null || files.Count == 0) {
                    _logger.LogWarning("❌ Multi-upload failed: No files provided");
                    return BadRequest(new { error = "No files provided." });
                }

                _logger.LogInformation($"📤 Multi-upload started: {files.Count} file(s)");

                var results = new List<object>();
                var failedFiles = new List<string>();

                foreach (var file in files) {
                    try {
                        if (file == null || file.Length == 0) {
                            _logger.LogWarning($"⏭️ Skipped: Empty file");
                            failedFiles.Add($"{file?.FileName}: Empty file");
                            continue;
                        }

                        if (file.Length > _maxFileSizeBytes) {
                            _logger.LogWarning($"⏭️ Skipped: {file.FileName} - File too large");
                            failedFiles.Add($"{file.FileName}: File too large");
                            continue;
                        }

                        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                        if (!_allowedExtensions.Contains(ext)) {
                            _logger.LogWarning($"⏭️ Skipped: {file.FileName} - Extension not allowed");
                            failedFiles.Add($"{file.FileName}: Extension '{ext}' not allowed");
                            continue;
                        }

                        var savedFileName = $"{Guid.NewGuid()}{ext}".Replace("\"", string.Empty);
                        var savePath = Path.Combine(_uploadRoot, savedFileName);

                        _logger.LogInformation($"📝 Saving: {file.FileName} to {savePath}");

                        await using (var stream = System.IO.File.Create(savePath)) {
                            await file.CopyToAsync(stream);
                        }

                        var result = new { 
                            originalName = file.FileName, 
                            storedName = savedFileName, 
                            size = file.Length, 
                            url = $"/{UploadFolderName}/{savedFileName}",
                            status = "✅ Success"
                        };
                        results.Add(result);

                        _logger.LogInformation($"✅ File uploaded successfully: {file.FileName} -> {savedFileName}");
                    } catch (Exception ex) {
                        _logger.LogError(ex, $"❌ Error uploading file: {file?.FileName}");
                        failedFiles.Add($"{file?.FileName}: {ex.Message}");
                    }
                }

                var response = new {
                    successful = results,
                    failed = failedFiles,
                    summary = $"✅ {results.Count}/{files.Count} files uploaded successfully"
                };

                _logger.LogInformation($"✅ Multi-upload completed: {results.Count}/{files.Count} successful");

                return Ok(response);
            } catch (Exception ex) {
                _logger.LogError(ex, "❌ Multi-upload failed with unexpected error");
                return StatusCode(500, new { error = $"Upload failed: {ex.Message}" });
            }
        }

        /// <summary>
        /// Debug endpoint: Trả về thông tin đường dẫn và danh sách file upload
        /// Chỉ dùng cho development/debugging
        /// </summary>
        [AllowAnonymous]
        [HttpGet("debug-paths")]
        public IActionResult DebugPaths() {
            try {
                var tmpFiles = Directory.Exists(_uploadRoot) 
                    ? Directory.GetFiles(_uploadRoot).Select(f => Path.GetFileName(f)).ToList()
                    : new List<string>();
                
                var publicFiles = Directory.Exists(_uploadPublic)
                    ? Directory.GetFiles(_uploadPublic).Select(f => Path.GetFileName(f)).ToList()
                    : new List<string>();

                var debugInfo = new {
                    info = "🔍 Debug Info - File Upload Paths",
                    tmpFolderPath = _uploadRoot,
                    publicFolderPath = _uploadPublic,
                    tmpFolderExists = Directory.Exists(_uploadRoot),
                    publicFolderExists = Directory.Exists(_uploadPublic),
                    tmpFilesCount = tmpFiles.Count,
                    tmpFiles = tmpFiles,
                    publicFilesCount = publicFiles.Count,
                    publicFiles = publicFiles,
                    note = "upload-public lưu vào: " + _uploadPublic + " folder"
                };

                return Ok(ApiResponse<object>.Success(debugInfo));
            } catch (Exception ex) {
                _logger.LogError(ex, "❌ Debug error");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
