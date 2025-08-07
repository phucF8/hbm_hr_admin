namespace HBM_HR_Admin_Angular2.Server.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class SaveUserRequest
    {
        public string Username { get; set; } = null!;
    }

}
