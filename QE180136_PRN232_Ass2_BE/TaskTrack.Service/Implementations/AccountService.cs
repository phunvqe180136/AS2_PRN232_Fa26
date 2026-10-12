using TaskTrack.Repo.Repositories;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Helpers;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.Service.Implementations;

public class AccountService : IAccountService
{
    private readonly IAccountRepository _accountRepo;

    public AccountService(IAccountRepository accountRepo)
    {
        _accountRepo = accountRepo;
    }

    public async Task<List<AccountDto>> GetAllAsync()
    {
        var accounts = await _accountRepo.GetAllAsync();
        var result = new List<AccountDto>();

        foreach (var a in accounts)
        {
            var taskCount = await _accountRepo.CountCreatedTasksAsync(a.AccountId);
            result.Add(new AccountDto
            {
                AccountId = a.AccountId,
                FullName = a.FullName,
                Email = a.Email,
                Role = a.Role,
                RoleName = Enums.GetRoleName(a.Role),
                CreatedDate = a.CreatedDate,
                CreatedTasksCount = taskCount
            });
        }

        return result;
    }

    public async Task<AccountDto?> GetByIdAsync(int id)
    {
        var a = await _accountRepo.GetByIdAsync(id);
        if (a is null) return null;

        var taskCount = await _accountRepo.CountCreatedTasksAsync(a.AccountId);
        return new AccountDto
        {
            AccountId = a.AccountId,
            FullName = a.FullName,
            Email = a.Email,
            Role = a.Role,
            RoleName = Enums.GetRoleName(a.Role),
            CreatedDate = a.CreatedDate,
            CreatedTasksCount = taskCount
        };
    }

    public async Task<(bool Success, string? ErrorMessage, AccountDto? Data)> UpdateAsync(int id, UpdateAccountDto dto)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account is null)
        {
            return (false, "Account not found.", null);
        }

        account.FullName = dto.FullName.Trim();
        account.Role = dto.Role;
        await _accountRepo.UpdateAsync(account);

        var updatedDto = await GetByIdAsync(id);
        return (true, null, updatedDto);
    }

    public async Task<(bool Success, string? ErrorMessage)> DeleteAsync(int id)
    {
        var account = await _accountRepo.GetByIdAsync(id);
        if (account is null)
        {
            return (false, "Account not found.");
        }

        // Enforce rule: must be rejected if the account has created any tasks
        var hasTasks = await _accountRepo.HasCreatedTasksAsync(id);
        if (hasTasks)
        {
            return (false, "Cannot delete account: This user has created tasks and cannot be removed.");
        }

        var deleted = await _accountRepo.DeleteAsync(id);
        if (!deleted)
        {
            return (false, "Failed to delete account.");
        }

        return (true, null);
    }
}
