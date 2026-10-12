using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ITagService _svc;
    public TagsController(ITagService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<TagDto>>> GetAll() =>
        Ok(await _svc.GetAllAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<TagDto>> GetById(int id)
    {
        var t = await _svc.GetByIdAsync(id);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<TagDto>> Create(TagCreateDto dto)
    {
        var created = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.TagId }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<ActionResult<TagDto>> Update(int id, TagUpdateDto dto)
    {
        var updated = await _svc.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var (ok, error) = await _svc.DeleteAsync(id);
        return ok ? NoContent() : BadRequest(new { error });
    }
}
