using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TaskTrack.Repo;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.Helpers;
using TaskTrack.Service.Implementations;
using TaskTrack.Service.Interfaces;
// Enable legacy timestamp behavior in Npgsql to support DateTime with any Kind
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ---------- DB Connection Resolution ----------
string rawConn = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
if (string.IsNullOrWhiteSpace(rawConn) || rawConn.StartsWith("${"))
{
    rawConn = builder.Configuration["DATABASE_URL"]
        ?? Environment.GetEnvironmentVariable("DATABASE_URL")
        ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
        ?? "";
}

static string NormalizeConnectionString(string raw)
{
    if (string.IsNullOrWhiteSpace(raw)) return raw;
    raw = raw.Trim();
    if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(raw);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
        var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var port = uri.Port > 0 ? uri.Port : 5432;
        var db = uri.AbsolutePath.TrimStart('/');
        return $"Host={uri.Host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true;";
    }
    // Auto-fix: if host is direct db.*.supabase.co but port is mistakenly set to 6543, switch to 5432
    if (raw.Contains(".supabase.co") && raw.Contains("Port=6543"))
    {
        raw = raw.Replace("Port=6543", "Port=5432");
    }
    return raw;
}

var connectionString = NormalizeConnectionString(rawConn);
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("PostgreSQL Connection string not found. Please set ConnectionStrings:DefaultConnection or DATABASE_URL.");
}

builder.Services.AddDbContext<TaskTrackDbContext>(opts =>
    opts.UseNpgsql(connectionString));

// ---------- Repositories ----------
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// ---------- Services & Helpers ----------
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IStatsService, StatsService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();

// ---------- JWT Authentication & Authorization ----------
var jwtSecret = builder.Configuration["Jwt:SecretKey"]
    ?? builder.Configuration["JWT_SECRET"]
    ?? builder.Configuration["Jwt:Secret"]
    ?? "PRN232_Assignment2_Super_Secret_Key_For_Authentication_At_Least_32_Chars!";

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TaskTrackAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TaskTrackClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };
});

builder.Services.AddAuthorization();

// ---------- MVC + Swagger with JWT Support ----------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TaskTrack API",
        Version = "v2",
        Description = "Task & Team Management Web API - PRN232 Assignment 2 (Authentication & Protected Management)"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.\r\nEnter 'Bearer' [space] and then your token in the text input below.\r\nExample: \"Bearer eyJhbGciOiJIUzI1Ni...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ---------- CORS for Vercel & Localhost ----------
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Enable Swagger in development and production (for assignment grading)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskTrack API v2");
    c.RoutePrefix = "swagger"; // Standard ASP.NET Core path: /swagger
});

// Redirect root and /index.html to /swagger for seamless access
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/index.html", () => Results.Redirect("/swagger"));

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api", () => Results.Ok(new { name = "TaskTrack API", status = "running", version = "v2", auth = "JWT enabled" }));

app.Run();
