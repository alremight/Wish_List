using WishList.DataAccess.Postgres.Entity;
using WishList.DataAccess.Postgres;
using WishList.API.Abstraction;
using Microsoft.EntityFrameworkCore;
using Mapster;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using WishList.DataAccess.Postgres.Models.User;


namespace WishList.API.Services
{
    public class UserService(WishListDbContext context, PasswordService passwordService, IDistributedCache distributedcashe) : IUserService
    {
        public async Task<List<UserDTO>> GetAllUser()
        {

            const string cacheKey = "all_users";
            byte[] cachedData = await distributedcashe.GetAsync(cacheKey);

            if (cachedData != null)
            {
                return JsonSerializer.Deserialize<List<UserDTO>>(cachedData);
            }

            var userEntity = await context.Users
                .AsNoTracking()
                .ToListAsync();

            var result = userEntity.Select(x => x.Adapt<UserDTO>()).ToList();

            var serializedData = JsonSerializer.SerializeToUtf8Bytes(result);
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));

            await distributedcashe.SetAsync(cacheKey, serializedData, cacheOptions);

            return result;
        }

        public async Task<string> Register(RegistrationUserDTO userRegisterModel)
        {
            var existingUser = await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == userRegisterModel.Email);

            if (existingUser != null)
            {
                throw new Exception("Этот email уже используется.");
            }
            

            var passwordHash = passwordService.HashPassword(userRegisterModel.PasswordHash);
            var user = new UserEntity(userRegisterModel.UserName,userRegisterModel.Email, passwordHash );

            try
            {
                await context.AddAsync(user);
                await context.SaveChangesAsync();

                var message = "Регистрация успешна.";
                return message;
            }
            catch (Exception ex)
            {

                var message = "Во время регистрации произошла ошибка. " + ex.Message.ToString();
                return message;
            }
        }

        public async Task<LoginResultDto> Login(LoginDto userLoginDto, HttpContext httpContext)
        {
            if (string.IsNullOrWhiteSpace(userLoginDto.Email) || string.IsNullOrWhiteSpace(userLoginDto.PasswordHash))
            {
                throw new Exception("Email и пароль обязательны.");
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == userLoginDto.Email);

            if (user == null)
            {
                throw new Exception("Пользователь не найден.");
            }

            bool isPasswordValid = passwordService.VerifyPassword(user.PasswordHash, userLoginDto.PasswordHash);

            if (!isPasswordValid)
            {
                throw new Exception("Неверный пароль.");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal);

            return new LoginResultDto
            {
                Message = "Авторизация успешна.",
                UserName = user.UserName
            };
        }


        public async Task<string> FindByUserName(string userName)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.UserName == userName);

            if (user == null)
            {
                throw new Exception("Пользователь не найден.");
            }

            var userId = user.Id.ToString();

            return userId;
        }
        public void Logout(HttpContext httpContext)
        {
            httpContext.Session.Clear(); 
            httpContext.Response.Cookies.Delete(".AspNetCore.Cookies");
        }

    }
}
