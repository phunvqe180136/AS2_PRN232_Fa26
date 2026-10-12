using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _svc;
    public ProjectsController(IProjectService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectDto>>> GetAll() =>
        Ok(await _svc.GetAllAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProjectDetailDto>> GetById(int id)
    {
        var p = await _svc.GetByIdAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("department/{departmentId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectDto>>> GetByDepartment(int departmentId) =>
        Ok(await _svc.GetByDepartmentAsync(departmentId));

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ProjectDto>> Create(ProjectCreateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var created = await _svc.CreateAsync(dto, currentUserId);
        return CreatedAtAction(nameof(GetById), new { id = created.ProjectId }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<ActionResult<ProjectDto>> Update(int id, ProjectUpdateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var updated = await _svc.UpdateAsync(id, dto, currentUserId);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var (ok, error) = await _svc.DeleteAsync(id);
        return ok ? NoContent() : BadRequest(new { error });
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectDto>>> Search(
        [FromQuery] string? name,
        [FromQuery] short? status,
        [FromQuery] int? departmentId) =>
        Ok(await _svc.SearchAsync(name, status, departmentId));

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("AccountID")
            ?? User.FindFirst("sub");

        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
