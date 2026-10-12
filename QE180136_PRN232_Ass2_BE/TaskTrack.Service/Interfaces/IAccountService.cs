using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Interfaces;

public interface IAccountService
{
    Task<List<AccountDto>> GetAllAsync();
    Task<AccountDto?> GetByIdAsync(int id);
    Task<(bool Success, string? ErrorMessage, AccountDto? Data)> UpdateAsync(int id, UpdateAccountDto dto);
    Task<(bool Success, string? ErrorMessage)> DeleteAsync(int id);
}
