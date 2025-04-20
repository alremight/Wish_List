namespace WishList.DataAccess.Postgres.Models.Chat
{
    public class CreateChatRoomDTO
    {
        public string Name { get; set; }
        public Guid? WishListId { get; set; }
        public List<Guid> ParticipantIds { get; set; } = new List<Guid>();
    }
}
