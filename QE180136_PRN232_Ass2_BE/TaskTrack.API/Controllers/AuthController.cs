using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Interfaces;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authSvc;

    public AuthController(IAuthService authSvc)
    {
        _authSvc = authSvc;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, data, isConflict) = await _authSvc.RegisterAsync(dto);
        if (!success)
        {
            if (isConflict)
            {
                return StatusCode(StatusCodes.Status409Conflict, new { error });
            }
            return BadRequest(new { error });
        }

        return StatusCode(StatusCodes.Status201Created, data);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, data) = await _authSvc.LoginAsync(dto);
        if (!success)
        {
            return Unauthorized(new { error = error ?? "Invalid credentials." });
        }

        return Ok(data);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (success, error, data) = await _authSvc.RefreshTokenAsync(dto);
        if (!success)
        {
            return Unauthorized(new { error = error ?? "Invalid refresh token." });
        }

        return Ok(data);
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var accountId = GetCurrentUserId();
        if (accountId is null)
        {
            return Unauthorized(new { error = "Unable to determine authenticated user." });
        }

        var profile = await _authSvc.GetProfileAsync(accountId.Value);
        if (profile is null)
        {
            return NotFound(new { error = "Account profile not found." });
        }

        return Ok(profile);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var accountId = GetCurrentUserId();
        if (accountId is null)
        {
            return Unauthorized(new { error = "Unable to determine authenticated user." });
        }

        var (success, error, updatedProfile) = await _authSvc.UpdateProfileAsync(accountId.Value, dto);
        if (!success)
        {
            return BadRequest(new { error });
        }

        return Ok(updatedProfile);
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("AccountID")
            ?? User.FindFirst("sub");

        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
