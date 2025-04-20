using WishList.DataAccess.Postgres.Models.WishList.Invitation;


namespace WishList.API.Abstraction
{
    public interface IWishListInvitationService
    {
        Task<string> CreateInvitation(InvitationRequestDTO request, Guid requesterId);
        Task<PendingResultDto> GetPendingInvitation(Guid userId);
        Task<string> ConfirmInvitation(ConfirmInvitationRequestDTO request, Guid userId);
        Task<string> RejectInvitation(RejectInvitationRequestDTO request, Guid userId);
    }
}
