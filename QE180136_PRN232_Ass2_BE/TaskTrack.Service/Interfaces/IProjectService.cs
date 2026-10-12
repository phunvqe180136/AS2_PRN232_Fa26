using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Interfaces;

public interface IProjectService
{
    Task<List<ProjectDto>> GetAllAsync();
    Task<ProjectDetailDto?> GetByIdAsync(int id);
    Task<List<ProjectDto>> GetByDepartmentAsync(int departmentId);
    Task<ProjectDto> CreateAsync(ProjectCreateDto dto, int? currentUserId = null);
    Task<ProjectDto?> UpdateAsync(int id, ProjectUpdateDto dto, int? currentUserId = null);
    Task<(bool ok, string? error)> DeleteAsync(int id);
    Task<List<ProjectDto>> SearchAsync(string? name, short? status, int? departmentId);
}
