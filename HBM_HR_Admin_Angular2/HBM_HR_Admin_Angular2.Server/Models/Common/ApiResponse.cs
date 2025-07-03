namespace HBM_HR_Admin_Angular2.Server.Models.Common
{
    public class ApiResponse<T>
    {
        public string Status { get; set; }  // "success" | "error"
        public string Message { get; set; }
        public T? Data { get; set; }

        public static ApiResponse<T> Success(T data, string message = "Thành công") => new ApiResponse<T> { Status = "SUCCESS", Message = message, Data = data };

        public static ApiResponse<T> Error(string message) => new ApiResponse<T> { Status = "FAIL", Message = message, Data = default };
    }

}
