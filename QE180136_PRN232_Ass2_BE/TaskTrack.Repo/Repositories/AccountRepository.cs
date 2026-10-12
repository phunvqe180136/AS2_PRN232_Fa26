using Microsoft.EntityFrameworkCore;
using TaskTrack.Repo.Models;

namespace TaskTrack.Repo.Repositories;

public interface IAccountRepository
{
    Task<List<SystemAccount>> GetAllAsync();
    Task<SystemAccount?> GetByIdAsync(int id);
    Task<SystemAccount?> GetByEmailAsync(string email);
    Task<SystemAccount?> GetByRefreshTokenAsync(string refreshToken);
    Task<SystemAccount> AddAsync(SystemAccount account);
    Task UpdateAsync(SystemAccount account);
    Task<bool> DeleteAsync(int id);
    Task<bool> HasCreatedTasksAsync(int accountId);
    Task<int> CountCreatedTasksAsync(int accountId);
}

public class AccountRepository : IAccountRepository
{
    private readonly TaskTrackDbContext _db;
    public AccountRepository(TaskTrackDbContext db) => _db = db;

    public Task<List<SystemAccount>> GetAllAsync() =>
        _db.Accounts.AsNoTracking()
            .Include(a => a.CreatedTasks)
            .OrderBy(a => a.AccountId)
            .ToListAsync();

    public Task<SystemAccount?> GetByIdAsync(int id) =>
        _db.Accounts
            .Include(a => a.CreatedTasks)
            .FirstOrDefaultAsync(a => a.AccountId == id);

    public Task<SystemAccount?> GetByEmailAsync(string email) =>
        _db.Accounts
            .FirstOrDefaultAsync(a => a.Email.ToLower() == email.Trim().ToLower());

    public Task<SystemAccount?> GetByRefreshTokenAsync(string refreshToken) =>
        _db.Accounts
            .FirstOrDefaultAsync(a => a.RefreshToken == refreshToken);

    public async Task<SystemAccount> AddAsync(SystemAccount account)
    {
        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();
        return account;
    }

    public async Task UpdateAsync(SystemAccount account)
    {
        _db.Accounts.Update(account);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var acc = await _db.Accounts.FindAsync(id);
        if (acc == null) return false;
        _db.Accounts.Remove(acc);
        await _db.SaveChangesAsync();
        return true;
    }

    public Task<bool> HasCreatedTasksAsync(int accountId) =>
        _db.Tasks.AnyAsync(t => t.CreatedById == accountId);

    public Task<int> CountCreatedTasksAsync(int accountId) =>
        _db.Tasks.CountAsync(t => t.CreatedById == accountId);
}
