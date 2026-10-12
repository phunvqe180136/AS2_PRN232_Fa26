namespace TaskTrack.Repo.Models;

public class SystemAccount
{
    public int AccountId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public short Role { get; set; } // 0 = Staff, 1 = Admin
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation properties for audit tracking
    public ICollection<ProjectTask> CreatedTasks { get; set; } = new List<ProjectTask>();
    public ICollection<ProjectTask> UpdatedTasks { get; set; } = new List<ProjectTask>();
    public ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
    public ICollection<Project> UpdatedProjects { get; set; } = new List<Project>();
}
