namespace WishList.DataAccess.Postgres.Models.Chat
{
    public class CreateMessageDTO
    {
        public string Content { get; set; }
        public Guid ChatRoomId { get; set; }
    }
}
