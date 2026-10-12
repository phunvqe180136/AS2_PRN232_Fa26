using Microsoft.EntityFrameworkCore;
using TaskTrack.Repo;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.Implementations;
using TaskTrack.Service.Interfaces;

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

// ---------- Services ----------
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IStatsService, StatsService>();

// ---------- MVC + Swagger ----------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "TaskTrack API",
        Version = "v1",
        Description = "Task & Team Management Web API - PRN232 Assignment 1"
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
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskTrack API v1");
    c.RoutePrefix = "swagger"; // Standard ASP.NET Core path: /swagger
});

// Redirect root and /index.html to /swagger for seamless access
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/index.html", () => Results.Redirect("/swagger"));

app.UseCors("AllowFrontend");
app.MapControllers();
app.MapGet("/api", () => Results.Ok(new { name = "TaskTrack API", status = "running", version = "v1" }));

app.Run();

