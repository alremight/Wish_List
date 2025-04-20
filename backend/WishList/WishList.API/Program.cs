using Microsoft.EntityFrameworkCore;
using WishList.API.Abstraction;
using WishList.API.Services;
using WishList.API.Services.ChatHub;
using WishList.DataAccess.Postgres;
using Microsoft.AspNetCore.Authentication.Cookies;
using WishList.API.Services.WishList;
using Microsoft.AspNetCore.Identity;
using MassTransit;
using Shared.Contracts;


var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
var configuration = builder.Configuration;

builder.Services.AddControllers();

builder.Services.AddMassTransit(config =>
{
    // ¬ producer
    config.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.Message<IWishListRequested>(x =>
        {
            x.SetEntityName("wish-list-requests"); // явное им€ Exchange
        });

    });
});


builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
               .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(e => {
    e.MaximumReceiveMessageSize = 102400000;
});
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<WishListDbContext>();
builder.Services.AddScoped<IWishService, WishService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWishListService, WishListService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<PasswordHasher<string>>();
builder.Services.AddScoped<IWishListInvitationService, WishListInvitationService>();

builder.Services.AddStackExchangeRedisCache(redisOptions =>
{
    string connection = builder.Configuration
        .GetConnectionString("Redis");

    redisOptions.Configuration = connection;
});

builder.Services.AddDbContext<WishListDbContext>(
    options =>
    {
        options.UseNpgsql(configuration.GetConnectionString(nameof(WishListDbContext)));
    });

var app = builder.Build();

app.UseRouting();

app.UseCors("AllowFrontend");
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<ChatHub>("/chatHub");
});

app.UseStaticFiles();
app.UseSwagger();
app.UseSwaggerUI();

app.Run();

