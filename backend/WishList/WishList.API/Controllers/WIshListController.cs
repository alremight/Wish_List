using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WishList.API.Abstraction;
using WishList.API.Services;
using WishList.DataAccess.Postgres;

namespace WishList.API.Controllers
{
    [ApiController]
    [Route("/wishlist")]
    public class WishListController(IWishListService wishList,WishListDbContext context) : ControllerBase
    {

        [HttpGet("check")]
        public async Task<IActionResult> CheckWishList()
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Пользователь не авторизирован");
            }

            var result = await wishList.CheckWishList(userId);

            return Ok(result);
        }
    }
}
