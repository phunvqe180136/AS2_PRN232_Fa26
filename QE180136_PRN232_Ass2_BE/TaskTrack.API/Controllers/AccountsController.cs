using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountSvc;

    public AccountsController(IAccountService accountSvc)
    {
        _accountSvc = accountSvc;
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountDto>>> GetAll()
    {
        var accounts = await _accountSvc.GetAllAsync();
        return Ok(accounts);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AccountDto>> GetById(int id)
    {
        var account = await _accountSvc.GetByIdAsync(id);
        return account is null ? NotFound(new { error = $"Account #{id} not found." }) : Ok(account);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AccountDto>> Update(int id, [FromBody] UpdateAccountDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, data) = await _accountSvc.UpdateAsync(id, dto);
        if (!success)
        {
            return error == "Account not found."
                ? NotFound(new { error })
                : BadRequest(new { error });
        }

        return Ok(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, error) = await _accountSvc.DeleteAsync(id);
        if (!success)
        {
            return error == "Account not found."
                ? NotFound(new { error })
                : BadRequest(new { error });
        }

        return NoContent();
    }
}
