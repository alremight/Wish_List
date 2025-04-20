using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres;
using WishList.DataAccess.Postgres.Models.User;

namespace WishList.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController(IUserService user, ILogger<UserController> logger) : ControllerBase
    {
        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> RegisterUser([FromBody] RegistrationUserDTO registrationUser, CancellationToken clt)
        {
            var result = await user.Register(registrationUser);
            return Ok(result);
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> LoginUser([FromBody] LoginDto login, CancellationToken clt)
        {
            logger.LogInformation("Авторизация успешна");

            var result = await user.Login(login, HttpContext);

            return Ok(result);
        }

        [HttpGet]
        [Route("get-all-users")]
        public async Task<IActionResult> GetOptions(CancellationToken clt)
        {
            var result = await user.GetAllUser();
            return Ok(result);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            user.Logout(HttpContext);
            return Ok(new { message = "Вы вышли из системы" });
        }
    }
}
