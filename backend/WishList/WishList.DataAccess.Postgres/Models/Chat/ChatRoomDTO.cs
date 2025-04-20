
namespace WishList.DataAccess.Postgres.Models.Chat
{
    public class ChatRoomDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? WishListId { get; set; }
        public List<ParticipantDTO> Participants { get; set; } = new List<ParticipantDTO>();
        public int UnreadCount { get; set; }
    }
}
