using System.ComponentModel.DataAnnotations;

namespace TaskTrack.Service.DTOs;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 150 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequestDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public int AccountId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public short Role { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class RefreshTokenRequestDto
{
    [Required(ErrorMessage = "Refresh Token is required.")]
    public string RefreshToken { get; set; } = string.Empty;
    public string? ExpiredToken { get; set; }
}

public class ProfileDto
{
    public int AccountId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public short Role { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public int CreatedTasksCount { get; set; }
}

public class UpdateProfileRequestDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(150, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    public string? CurrentPassword { get; set; }

    [MinLength(6, ErrorMessage = "New password must be at least 6 characters.")]
    public string? NewPassword { get; set; }
}
