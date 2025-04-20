namespace WishList.DataAccess.Postgres.Models.Chat
{
    public class PaginatedMessagesResponseDTO
    {
        public List<ChatMessageDTO> Messages { get; set; } = new List<ChatMessageDTO>();
        public bool HasMore { get; set; }
        public int TotalCount { get; set; }
    }
}
