using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TaskTrack.Repo.Models;
using TaskTrack.Service.Helpers;

namespace TaskTrack.Service.Helpers;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) GenerateToken(SystemAccount account);
    string GenerateRefreshToken();
}

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _config;
    public JwtTokenGenerator(IConfiguration config) => _config = config;

    public (string Token, DateTime ExpiresAt) GenerateToken(SystemAccount account)
    {
        var secret = _config["Jwt:SecretKey"]
            ?? _config["JWT_SECRET"]
            ?? _config["Jwt:Secret"]
            ?? "PRN232_Assignment2_Super_Secret_Key_For_Authentication_At_Least_32_Chars!";

        var issuer = _config["Jwt:Issuer"] ?? "TaskTrackAPI";
        var audience = _config["Jwt:Audience"] ?? "TaskTrackClient";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddHours(24);

        var roleName = Enums.GetRoleName(account.Role);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.AccountId.ToString()),
            new("AccountID", account.AccountId.ToString()),
            new(ClaimTypes.Email, account.Email),
            new(ClaimTypes.Name, account.FullName),
            new(ClaimTypes.Role, roleName),
            new("Role", account.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var handler = new JwtSecurityTokenHandler();
        var securityToken = handler.CreateToken(tokenDescriptor);
        var tokenString = handler.WriteToken(securityToken);

        return (tokenString, expiresAt);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}
