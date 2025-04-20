using WishList.DataAccess.Postgres.Models.User;

namespace WishList.API.Abstraction;

public interface IUserService
{
    Task<List<UserDTO>> GetAllUser();
    Task<string> Register(RegistrationUserDTO userRegisterModel);
    Task<LoginResultDto> Login(LoginDto userLoginDto, HttpContext httpContext);  
    Task<string> FindByUserName(string userName);
    void Logout(HttpContext httpContext);
}