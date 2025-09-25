namespace HBM_HR_Admin_Angular2.Server.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty; // NOT NULL
        public string FullName { get; set; } = string.Empty; // NOT NULL
        public string? AvatarUrl { get; set; } // NULLABLE
        public DateTime CreatedAt { get; set; }
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string AvatarUrl { get; set; } = null!;
        public List<PermissionDto> Permissions { get; set; }
    }

    public class PermissionDto {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; }
    }

    public class SaveUserRequest
    {
        public string Username { get; set; } = null!;
    }

    public class Permission
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }
    public class UserPermission
    {
        public int Id { get; set; } // Khóa chính mới
        public Guid UserId { get; set; }
        public int PermissionId { get; set; }
        public DateTime? AssignedAt { get; set; }

        // Navigation properties (tùy chọn)
        public User User { get; set; }
        public Permission Permission { get; set; }
    }

    public class UserPermissionDto
    {
        public Guid UserId { get; set; }
        public List<int> PermissionIds { get; set; } = new();
    }

    public class AssignPermissionsDto
    {
        public Guid UserId { get; set; }
        public List<int> PermissionIds { get; set; }
    }


}
