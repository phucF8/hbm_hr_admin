using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using HBM_HR_Admin_Angular2.Server.Data;
using Microsoft.EntityFrameworkCore;
using HBM_HR_Admin_Angular2.Server.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Thêm dịch vụ CORS
builder.Services.AddCors(options =>
{

    options.AddPolicy("AllowAngular",
    policy => policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<NotificationRepository>();
builder.Services.AddScoped<IDebugRepository, DebugRepository>();



// Đăng ký dịch vụ FirebaseNotificationService
builder.Services.AddSingleton<FirebaseNotificationService>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8088); // Cho phép lắng nghe mọi IP
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Bật Swagger khi ở chế độ Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
// Áp dụng CORS
app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
