using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Interfaces;

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Data, bool IsConflict)> RegisterAsync(RegisterRequestDto dto);
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Data)> LoginAsync(LoginRequestDto dto);
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Data)> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task<ProfileDto?> GetProfileAsync(int accountId);
    Task<(bool Success, string? ErrorMessage, ProfileDto? Data)> UpdateProfileAsync(int accountId, UpdateProfileRequestDto dto);
}
