using TaskTrack.Repo.Models;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Helpers;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.Service.Implementations;

public class AuthService : IAuthService
{
    private readonly IAccountRepository _accountRepo;
    private readonly IJwtTokenGenerator _jwtGen;

    public AuthService(IAccountRepository accountRepo, IJwtTokenGenerator jwtGen)
    {
        _accountRepo = accountRepo;
        _jwtGen = jwtGen;
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponseDto? Data, bool IsConflict)> RegisterAsync(RegisterRequestDto dto)
    {
        var existing = await _accountRepo.GetByEmailAsync(dto.Email);
        if (existing is not null)
        {
            return (false, "Email is already registered. Please login or use a different email.", null, true);
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var account = new SystemAccount
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            Role = 0, // Enforce: Register API only creates Staff accounts (0)
            CreatedDate = DateTime.UtcNow
        };

        var (token, expiresAt) = _jwtGen.GenerateToken(account);
        var refreshToken = _jwtGen.GenerateRefreshToken();

        account.RefreshToken = refreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await _accountRepo.AddAsync(account);

        var authResponse = new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            RoleName = Enums.GetRoleName(account.Role),
            ExpiresAt = expiresAt
        };

        return (true, null, authResponse, false);
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponseDto? Data)> LoginAsync(LoginRequestDto dto)
    {
        var account = await _accountRepo.GetByEmailAsync(dto.Email);
        if (account is null)
        {
            return (false, "Invalid email or password.", null);
        }

        bool isPasswordValid = false;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, account.PasswordHash);
        }
        catch
        {
            isPasswordValid = false;
        }

        if (!isPasswordValid)
        {
            return (false, "Invalid email or password.", null);
        }

        var (token, expiresAt) = _jwtGen.GenerateToken(account);
        var refreshToken = _jwtGen.GenerateRefreshToken();

        account.RefreshToken = refreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _accountRepo.UpdateAsync(account);

        var authResponse = new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            RoleName = Enums.GetRoleName(account.Role),
            ExpiresAt = expiresAt
        };

        return (true, null, authResponse);
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponseDto? Data)> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            return (false, "Invalid refresh token.", null);
        }

        var account = await _accountRepo.GetByRefreshTokenAsync(dto.RefreshToken.Trim());
        if (account is null || account.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return (false, "Refresh token is invalid or has expired. Please login again.", null);
        }

        var (token, expiresAt) = _jwtGen.GenerateToken(account);
        var newRefreshToken = _jwtGen.GenerateRefreshToken();

        account.RefreshToken = newRefreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _accountRepo.UpdateAsync(account);

        var authResponse = new AuthResponseDto
        {
            Token = token,
            RefreshToken = newRefreshToken,
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            RoleName = Enums.GetRoleName(account.Role),
            ExpiresAt = expiresAt
        };

        return (true, null, authResponse);
    }

    public async Task<ProfileDto?> GetProfileAsync(int accountId)
    {
        var account = await _accountRepo.GetByIdAsync(accountId);
        if (account is null) return null;

        var tasksCount = await _accountRepo.CountCreatedTasksAsync(accountId);

        return new ProfileDto
        {
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            RoleName = Enums.GetRoleName(account.Role),
            CreatedDate = account.CreatedDate,
            CreatedTasksCount = tasksCount
        };
    }

    public async Task<(bool Success, string? ErrorMessage, ProfileDto? Data)> UpdateProfileAsync(int accountId, UpdateProfileRequestDto dto)
    {
        var account = await _accountRepo.GetByIdAsync(accountId);
        if (account is null) return (false, "Account not found.", null);

        if (!string.IsNullOrWhiteSpace(dto.FullName))
        {
            account.FullName = dto.FullName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            {
                return (false, "Current password is required to set a new password.", null);
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, account.PasswordHash))
            {
                return (false, "Current password is incorrect.", null);
            }

            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        await _accountRepo.UpdateAsync(account);

        var profile = await GetProfileAsync(accountId);
        return (true, null, profile);
    }
}
