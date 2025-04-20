namespace WishList.DataAccess.Postgres.Entity;

public class ChatRoomParticipantEntity
{
    public Guid ChatRoomId { get; set; }
    public ChatRoomEntity ChatRoom { get; set; }

    public Guid UserId { get; set; }
    public UserEntity User { get; set; }

    public DateTime JoinedAt { get; set; }
    public DateTime? LastRead { get; set; }

}
