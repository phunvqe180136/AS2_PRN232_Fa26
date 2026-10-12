using Microsoft.EntityFrameworkCore;
using TaskTrack.Repo.Models;

namespace TaskTrack.Repo;

public class TaskTrackDbContext : DbContext
{
    public TaskTrackDbContext(DbContextOptions<TaskTrackDbContext> options) : base(options) { }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<SystemAccount> Accounts => Set<SystemAccount>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ---- Department ----
        b.Entity<Department>(e =>
        {
            e.ToTable("Department");
            e.HasKey(x => x.DepartmentId);
            e.Property(x => x.DepartmentId).HasColumnName("DepartmentID");
            e.Property(x => x.DepartmentName).HasColumnName("DepartmentName").HasMaxLength(100).IsRequired();
            e.Property(x => x.DepartmentDescription).HasColumnName("DepartmentDescription").HasMaxLength(300).IsRequired();
            e.Property(x => x.IsActive).HasColumnName("IsActive");
        });

        // ---- SystemAccount ----
        b.Entity<SystemAccount>(e =>
        {
            e.ToTable("SystemAccount");
            e.HasKey(x => x.AccountId);
            e.Property(x => x.AccountId).HasColumnName("AccountID");
            e.Property(x => x.FullName).HasColumnName("FullName").HasMaxLength(150).IsRequired();
            e.Property(x => x.Email).HasColumnName("Email").HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(255).IsRequired();
            e.Property(x => x.Role).HasColumnName("Role").HasDefaultValue((short)0);
            e.Property(x => x.RefreshToken).HasColumnName("RefreshToken").HasMaxLength(255);
            e.Property(x => x.RefreshTokenExpiryTime).HasColumnName("RefreshTokenExpiryTime");
            e.Property(x => x.CreatedDate).HasColumnName("CreatedDate");
        });

        // ---- Project ----
        b.Entity<Project>(e =>
        {
            e.ToTable("Project");
            e.HasKey(x => x.ProjectId);
            e.Property(x => x.ProjectId).HasColumnName("ProjectID");
            e.Property(x => x.ProjectName).HasColumnName("ProjectName").HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasColumnName("Description");
            e.Property(x => x.StartDate).HasColumnName("StartDate");
            e.Property(x => x.EndDate).HasColumnName("EndDate");
            e.Property(x => x.Status).HasColumnName("Status");
            e.Property(x => x.DepartmentId).HasColumnName("DepartmentID");
            e.Property(x => x.IsActive).HasColumnName("IsActive");
            e.Property(x => x.CreatedDate).HasColumnName("CreatedDate");
            e.Property(x => x.CreatedById).HasColumnName("CreatedByID");
            e.Property(x => x.UpdatedById).HasColumnName("UpdatedByID");

            e.HasOne(x => x.Department).WithMany(d => d.Projects).HasForeignKey(x => x.DepartmentId)
                .HasConstraintName("FK_Project_Department");

            e.HasOne(x => x.CreatedBy).WithMany(a => a.CreatedProjects).HasForeignKey(x => x.CreatedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Project_CreatedBy");

            e.HasOne(x => x.UpdatedBy).WithMany(a => a.UpdatedProjects).HasForeignKey(x => x.UpdatedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Project_UpdatedBy");
        });

        // ---- Task (entity class: ProjectTask) ----
        b.Entity<ProjectTask>(e =>
        {
            e.ToTable("Task");
            e.HasKey(x => x.TaskId);
            e.Property(x => x.TaskId).HasColumnName("TaskID");
            e.Property(x => x.Title).HasColumnName("Title").HasMaxLength(300).IsRequired();
            e.Property(x => x.Description).HasColumnName("Description");
            e.Property(x => x.Status).HasColumnName("Status");
            e.Property(x => x.Priority).HasColumnName("Priority");
            e.Property(x => x.DueDate).HasColumnName("DueDate");
            e.Property(x => x.ProjectId).HasColumnName("ProjectID");
            e.Property(x => x.IsActive).HasColumnName("IsActive");
            e.Property(x => x.CreatedDate).HasColumnName("CreatedDate");
            e.Property(x => x.ModifiedDate).HasColumnName("ModifiedDate");
            e.Property(x => x.CreatedById).HasColumnName("CreatedByID");
            e.Property(x => x.UpdatedById).HasColumnName("UpdatedByID");

            e.HasOne(x => x.Project).WithMany(p => p.Tasks).HasForeignKey(x => x.ProjectId)
                .HasConstraintName("FK_Task_Project");

            e.HasOne(x => x.CreatedBy).WithMany(a => a.CreatedTasks).HasForeignKey(x => x.CreatedById)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Task_CreatedBy");

            e.HasOne(x => x.UpdatedBy).WithMany(a => a.UpdatedTasks).HasForeignKey(x => x.UpdatedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Task_UpdatedBy");
        });

        // ---- Tag ----
        b.Entity<Tag>(e =>
        {
            e.ToTable("Tag");
            e.HasKey(x => x.TagId);
            e.Property(x => x.TagId).HasColumnName("TagID");
            e.Property(x => x.TagName).HasColumnName("TagName").HasMaxLength(50).IsRequired();
            e.Property(x => x.Color).HasColumnName("Color").HasMaxLength(7);
        });

        // ---- Task <-> Tag (many-to-many qua bảng TaskTag) ----
        b.Entity<ProjectTask>()
            .HasMany(t => t.Tags)
            .WithMany(t => t.Tasks)
            .UsingEntity<Dictionary<string, object>>(
                "TaskTag",
                right => right.HasOne<Tag>().WithMany().HasForeignKey("TagID")
                    .HasConstraintName("FK_TaskTag_Tag"),
                left => left.HasOne<ProjectTask>().WithMany().HasForeignKey("TaskID")
                    .HasConstraintName("FK_TaskTag_Task"),
                join =>
                {
                    join.ToTable("TaskTag");
                    join.HasKey("TaskID", "TagID");
                });
    }
}
