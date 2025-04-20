namespace WishList.DataAccess.Postgres.Entity;
public class WishListInvitationEntity
{
    public Guid Id { get; set; }
    public string RequesterId { get; set; }    
    public string InviteeId { get; set; }      
    public string Token { get; set; }       
    public DateTime CreatedAt { get; set; }
    public bool IsAccepted { get; set; }
}
