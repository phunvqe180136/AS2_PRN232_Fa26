using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _svc;
    public TasksController(ITaskService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectTaskDto>>> GetAll() =>
        Ok(await _svc.GetAllAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProjectTaskDto>> GetById(int id)
    {
        var t = await _svc.GetByIdAsync(id);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpGet("project/{projectId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectTaskDto>>> GetByProject(int projectId) =>
        Ok(await _svc.GetByProjectAsync(projectId));

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ProjectTaskDto>> Create(ProjectTaskCreateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var created = await _svc.CreateAsync(dto, currentUserId);
        return CreatedAtAction(nameof(GetById), new { id = created.TaskId }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<ActionResult<ProjectTaskDto>> Update(int id, ProjectTaskUpdateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var updated = await _svc.UpdateAsync(id, dto, currentUserId);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var currentUserId = GetCurrentUserId();
        var (ok, error) = await _svc.DeleteAsync(id, currentUserId);
        return ok ? NoContent() : BadRequest(new { error });
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProjectTaskDto>>> Search(
        [FromQuery] string? title,
        [FromQuery] short? status,
        [FromQuery] short? priority,
        [FromQuery] int? projectId,
        [FromQuery] int? tagId) =>
        Ok(await _svc.SearchAsync(title, status, priority, projectId, tagId));

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("AccountID")
            ?? User.FindFirst("sub");

        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
