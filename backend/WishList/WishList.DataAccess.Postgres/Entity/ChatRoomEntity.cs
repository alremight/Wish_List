namespace WishList.DataAccess.Postgres.Entity;
public class ChatRoomEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }


    public Guid? WishListId { get; set; }
    public WishListEntity WishList { get; set; }


    public List<ChatMessageEntity> Messages { get; set; } = new List<ChatMessageEntity>();
    public List<ChatRoomParticipantEntity> Participants { get; set; } = new List<ChatRoomParticipantEntity>();
}
