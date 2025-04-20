namespace WishList.DataAccess.Postgres.Models.WishList.Invitation
{
    public class PendingResultDto
    {
        public bool Exists { get; set; }

        public Guid InvitationId { get; set; }
    }
}
