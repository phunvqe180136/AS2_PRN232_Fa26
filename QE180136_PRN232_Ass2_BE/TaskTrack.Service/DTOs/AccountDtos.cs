using System.ComponentModel.DataAnnotations;

namespace TaskTrack.Service.DTOs;

public class AccountDto
{
    public int AccountId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public short Role { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public int CreatedTasksCount { get; set; }
}

public class UpdateAccountDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 150 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Range(0, 1, ErrorMessage = "Role must be 0 (Staff) or 1 (Admin).")]
    public short Role { get; set; }
}
