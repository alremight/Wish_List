namespace WishList.DataAccess.Postgres.Entity;

public class ChatMessageEntity
{
    public Guid Id { get; set; }
    public string? Content { get; set; }
    public Guid SenderId { get; set; }
    public UserEntity? Sender { get; set; }
    public Guid ChatRoomId { get; set; }
    public ChatRoomEntity? ChatRoom { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
}