using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres.Models;
using MassTransit;
using Shared.Contracts;

namespace WishList.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WishController(
        IWishService wishes, 
        ILogger<WishController> logger,
        IPublishEndpoint publishEndpoint) : ControllerBase
    {
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateEditWishDTO createWishDTO, IFormFile imageFile, CancellationToken clt)
        {
            try
            {
                var userId = GetUserId();
                var wishDto = await wishes.Create(createWishDTO, imageFile, userId);
                return Ok(wishDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message,
                    InnerException = ex.InnerException?.Message
                });
            }
        }
        
        [HttpGet("auth-user-wishes")]
        public async Task<IActionResult> GetUserWishes(CancellationToken clt)
        {

            try
            {
                var userId = GetUserId();
                var result = await wishes.GetUserWishes(userId);
                return Ok(new { wishes = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("update-wish")]
        public async Task<IActionResult> UpdateWish(Guid wishId, [FromBody] CreateEditWishDTO editDTO, CancellationToken clt)
        {
            GetUserId();
            var result = await wishes.Edit(editDTO, wishId);
            return Ok(new { wishes = result });
        }
        
        [HttpDelete("delete-wish")]
        public async Task<IActionResult> DeleteWish(Guid wishId, [FromBody] CancellationToken clt)
        {
            GetUserId();
            var result = await wishes.Delete(wishId);

            return Ok(new { wishes = result });

        }
        
        [HttpGet("{wishListId}")] 
        public async Task<IActionResult> GetWishesByWishListId(Guid wishListId)
        {
            var result = await wishes.GetWishesByWishListId(wishListId);
            return Ok(result); 
        }
        private Guid GetUserId()
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Пользовать не авторизирован");
            }

            return userId;
        }

        [HttpGet("allWish")]
        public async Task<IActionResult> GetAllWish(CancellationToken clt)
        {
            var result = await wishes.GetAllWish();
            await publishEndpoint.Publish<IWishListRequested>(new WishListRequestedEvent
            {
                Timestamp = DateTime.UtcNow,
                Count = result.Count
            });
            return Ok(new { wishes = result });
        }


    }

    

}
