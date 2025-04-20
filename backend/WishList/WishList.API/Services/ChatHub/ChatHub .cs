using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres.Models.Chat;

namespace WishList.API.Services.ChatHub
{
    [Authorize]
    public class ChatHub(IChatService chatService) : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            var chatRooms = await chatService.GetUserChatRooms(userId);

            foreach (var room in chatRooms)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, room.Id.ToString());
            }

            await base.OnConnectedAsync();
        }

        public async Task JoinChatRoom(string chatRoomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);
        }

        public async Task LeaveChatRoom(string chatRoomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoomId);
        }

        public async Task SendMessage(CreateMessageDTO messageDTO)
        {
            var userId = GetUserId();
            var message = await chatService.SendMessage(messageDTO, userId);

            await Clients.Group(messageDTO.ChatRoomId.ToString())
                .SendAsync("ReceiveMessage", message);
        }

        public async Task MarkAsRead(Guid chatRoomId)
        {
            var userId = GetUserId();
            await chatService.MarkMessagesAsRead(chatRoomId, userId);

            await Clients.Group(chatRoomId.ToString())
                .SendAsync("MessagesRead", userId, chatRoomId);
        }

        private Guid GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userGuid))
            {
                throw new Exception("Unable to determine user id");
            }
            return userGuid;
        }

    }
}
