using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres.Models.Chat;

namespace WishList.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController(IChatService _chatService) : ControllerBase
    {
        [HttpPost("rooms")]
        public async Task<ActionResult<ChatRoomDTO>> CreateChatRoom(CreateChatRoomDTO createChatRoomDTO)
        {
            try
            {
                var userId = GetUserId();
                var chatRoom = await _chatService.CreateChatRoom(createChatRoomDTO, userId);
                return Ok(chatRoom);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("rooms")]
        public async Task<ActionResult<List<ChatRoomDTO>>> GetUserChatRooms()
        {
            try
            {
                var userId = GetUserId();
                var chatRooms = await _chatService.GetUserChatRooms(userId);
                return Ok(chatRooms);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("rooms/{chatRoomId}")]
        public async Task<ActionResult<ChatRoomDTO>> GetChatRoomById(Guid chatRoomId)
        {
            try
            {
                var userId = GetUserId();
                var chatRoom = await _chatService.GetChatRoomById(chatRoomId, userId);
                return Ok(chatRoom);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("rooms/{chatRoomId}/messages")]
        public async Task<ActionResult<PaginatedMessagesResponseDTO>> GetChatMessages(
            Guid chatRoomId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetUserId();
                var messages = await _chatService.GetChatMessages(chatRoomId, userId, page, pageSize);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("messages")]
        public async Task<ActionResult<ChatMessageDTO>> SendMessage(CreateMessageDTO messageDTO)
        {
            try
            {
                var userId = GetUserId();
                var message = await _chatService.SendMessage(messageDTO, userId);
                return Ok(message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("rooms/{chatRoomId}/read")]
        public async Task<ActionResult> MarkMessagesAsRead(Guid chatRoomId)
        {
            try
            {
                var userId = GetUserId();
                await _chatService.MarkMessagesAsRead(chatRoomId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("unread")]
        public async Task<ActionResult<int>> GetUnreadMessagesCount()
        {
            try
            {
                var userId = GetUserId();
                var count = await _chatService.GetUnreadMessagesCount(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("rooms/{chatRoomId}/participants/{userId}")]
        public async Task<ActionResult> AddUserToChatRoom(Guid chatRoomId, Guid userId)
        {
            try
            {
                await _chatService.AddUserToChatRoom(chatRoomId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("rooms/{chatRoomId}/participants/{userId}")]
        public async Task<ActionResult> RemoveUserFromChatRoom(Guid chatRoomId, Guid userId)
        {
            try
            {
                await _chatService.RemoveUserFromChatRoom(chatRoomId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
