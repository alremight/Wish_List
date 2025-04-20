using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres.Models.WishList.Invitation;

namespace WishList.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WishListInvitationController(IWishListInvitationService wishListInvitationService) : ControllerBase
    {

        [HttpPost("invite")]
        public async Task<IActionResult> CreateInvitation([FromBody] InvitationRequestDTO request)
        {
            var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var requesterId))
            {
                return Unauthorized("Пользователь не авторизирован");
            }

            var result = await wishListInvitationService.CreateInvitation(request, requesterId);

            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingInvitation()
        {
            var userId = GetUserId();

            var result = await wishListInvitationService.GetPendingInvitation(userId);

            return Ok(result);

        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmInvitation([FromBody] ConfirmInvitationRequestDTO request)
        {
            var userId = GetUserId();

            var result = await wishListInvitationService.ConfirmInvitation(request, userId);

            return Ok(result);
        }

        [HttpPost("reject")]
        public async Task<IActionResult> RejectInvitation([FromBody] RejectInvitationRequestDTO request)
        {
            var userId = GetUserId();

            var result = await wishListInvitationService.RejectInvitation(request, userId);

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
    }
}



