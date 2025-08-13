using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using HBM_HR_Admin_Angular2.Server.constance;
using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Middleware;
using HBM_HR_Admin_Angular2.Server.Models.Common;
using HBM_HR_Admin_Angular2.Server.Repositories;
using HBM_HR_Admin_Angular2.Server.Services;
using HBM_HR_Admin_Angular2.Server.Voting.Repositories;
using HBM_HR_Admin_Angular2.Server.Voting.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Thêm dịch vụ CORS
builder.Services.AddCors(options =>
{

    options.AddPolicy("AllowAngular",
    policy => policy
    .AllowAnyOrigin()
    //.WithOrigins("http://admin.hbm.vn:8099")
    .AllowAnyMethod()
    .AllowAnyHeader());
});

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<NotificationRepository>();
builder.Services.AddScoped<IDebugRepository, DebugRepository>();
builder.Services.AddScoped<IThongBaoService, ThongBaoService>();

// Đăng ký DI
builder.Services.AddScoped<ITopicService, TopicService>();
builder.Services.AddScoped<ITopicRepository, TopicRepository>(); // nếu dùng

//Đăng nh
builder.Services.AddScoped<JwtTokenGenerator>();
//builder.Services.AddScoped<HrAuthService>();
builder.Services.AddHttpClient<HrAuthService>();





// Đăng ký dịch vụ FirebaseNotificationService
builder.Services.AddSingleton<FirebaseNotificationService>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8088); // Cho phép lắng nghe mọi IP
});

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>();
// Thêm Authentication với JWT Bearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtTokenGenerator>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errorMessages = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .Select(e => $"{e.Key}: {e.Value.Errors.First().ErrorMessage}")
            .ToList();
        var response = ApiResponse<string>.Error(string.Join(" | ", errorMessages));
        return new BadRequestObjectResult(response);
    };
});


var app = builder.Build();

// Áp dụng CORS
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

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
app.UseMiddleware<ExceptionHandlingMiddleware>();



app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
