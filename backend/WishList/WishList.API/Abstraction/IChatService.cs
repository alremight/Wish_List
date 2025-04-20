

using WishList.DataAccess.Postgres.Models.Chat;

namespace WishList.API.Abstraction;

public interface IChatService
{
    Task<ChatRoomDTO> CreateChatRoom(CreateChatRoomDTO createChatRoomDTO, Guid creatorId);
    Task<List<ChatRoomDTO>> GetUserChatRooms(Guid userId);
    Task<ChatRoomDTO> GetChatRoomById(Guid chatRoomId, Guid userId);
    Task<ChatMessageDTO> SendMessage(CreateMessageDTO messageDTO, Guid senderId);
    Task<PaginatedMessagesResponseDTO> GetChatMessages(Guid chatRoomId, Guid userId, int page, int pageSize);
    Task MarkMessagesAsRead(Guid chatRoomId, Guid userId);
    Task<int> GetUnreadMessagesCount(Guid userId);
    Task AddUserToChatRoom(Guid chatRoomId, Guid userId);
    Task RemoveUserFromChatRoom(Guid chatRoomId, Guid userId);
}