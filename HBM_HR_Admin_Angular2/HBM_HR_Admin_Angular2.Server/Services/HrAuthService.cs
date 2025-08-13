using System.Text;
using System.Text.Json;

namespace HBM_HR_Admin_Angular2.Server.Services
{
    public class HrAuthService
    {
        private readonly HttpClient _httpClient;

        public HrAuthService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<HrLoginResponse> AuthenticateAsync(string username, string password)
        {
            // Tạo payload giống bên Angular
            var payload = new
            {
                AccessToken = "eaf0789cc663860acbf99017282eab25",
                NhanVienInfo = new
                {
                    Username = username,
                    Password = password
                }
            };

            // Chuyển thành JSON
            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            // Gọi API HR đúng endpoint
            var response = await _httpClient.PostAsync(
                "https://apihr.hbm.vn:9004/api/hr/admin/DoCheckLogin",
                content
            );

            if (!response.IsSuccessStatusCode)
                return new HrLoginResponse
                {
                    Status = "FAIL",
                    Message = $"HTTP Error: {response.StatusCode}"
                };

            // Đọc kết quả từ API HR
            var jsonString = await response.Content.ReadAsStringAsync();

            // API HR trả về object có Status, SUCCESS mới là login OK
            var result = JsonSerializer.Deserialize<HrLoginResponse>(
                jsonString,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (result?.Status == "SUCCESS")
            {
                var nhanVien = result.DataSets?.Table?.FirstOrDefault();
                var permissions = result.DataSets?.Table1;
                var menus = result.DataSets?.Table2;
                // Ví dụ:
                Console.WriteLine($"Tên nhân viên: {nhanVien?.TenNhanVien}");
            }

            return new HrLoginResponse
            {
                Status = result.Status,
                DataSets = result.DataSets
            };
        }

        // Model cho response của API HR
        public class HrLoginResponse
        {
            public string Status { get; set; }
            public string Message { get; set; }
            public DataSets DataSets { get; set; }
        }

        public class DataSets
        {
            public List<EmployeeInfo> Table { get; set; }
            public List<UserPermission> Table1 { get; set; }
            public List<UserMenu> Table2 { get; set; }
        }

        public class EmployeeInfo
        {
            public string ID { get; set; }
            public string IDPhongBan { get; set; }
            public string IDKhoLamViec { get; set; }
            public int IdChucVu { get; set; }
            public string HinhThucLamViec { get; set; }
            public DateTime NgayHoSo { get; set; }
            public string MaNhanVien { get; set; }
            public string TenNhanVien { get; set; }
            public string Username { get; set; }
            public string UserID { get; set; }
            public string TenPhongBan { get; set; }
            public string TenChucVu { get; set; }
            public string IDBoPhan { get; set; }
            public int IDChucDanh { get; set; }
            public string TenChucDanh { get; set; }
            public string Anh { get; set; }
            public string TenBoPhan { get; set; }
            public string TenDonVi { get; set; }
            public string DiDong { get; set; }
            public string MaPhongBan { get; set; }
        }

        public class UserPermission
        {
            public string ID { get; set; }
            public string ModuleID { get; set; }
            public string FunctionID { get; set; }
            public int ViTri { get; set; }
            public string Code { get; set; }
            public string Name { get; set; }
        }

        public class UserMenu
        {
            public string ID { get; set; }
            public string Code { get; set; }
            public string Url { get; set; }
            public string IconUrl { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public bool Visible { get; set; }
            public string ParentId { get; set; }
            public bool ShowHome { get; set; }
            public string ShowFor { get; set; }
            public int Order { get; set; }
            public bool TrangThai { get; set; }
            public string TitleLevel { get; set; }
        }


    }
}
