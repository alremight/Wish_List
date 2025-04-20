using Microsoft.EntityFrameworkCore;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres;
using WishList.DataAccess.Postgres.Entity;
using WishList.DataAccess.Postgres.Models.WishList.Invitation;

namespace WishList.API.Services.WishList
{
    public class WishListInvitationService(WishListDbContext context) : IWishListInvitationService
    {
        public async Task<string> ConfirmInvitation(ConfirmInvitationRequestDTO request, Guid userId)
        {
            var invitation = await context.WishListInvitations
                .FirstOrDefaultAsync(i => i.Id.ToString() == request.InvitationId && i.InviteeId == userId.ToString());

            if (invitation == null)
            {
                throw new Exception("Приглашение не найден");
            }

            if (invitation.IsAccepted)
            {
                throw new Exception("Приглашение уже подтверждено");
            }

            invitation.IsAccepted = true;

            var wishList = new WishListEntity { WishListName = "Новый общий WishList" };
            var requester = await context.Users.FindAsync(Guid.Parse(invitation.RequesterId));
            var invitee = await context.Users.FindAsync(Guid.Parse(invitation.InviteeId));
            wishList.Users.Add(requester);
            wishList.Users.Add(invitee);

            context.WishLists.Add(wishList);
            await context.SaveChangesAsync();

            return "Приглашение подтверждено";
        }

        public async Task<string> CreateInvitation(InvitationRequestDTO request, Guid requesterId)
        {
            var invitee = await context.Users.FirstOrDefaultAsync(u => u.UserName == request.InviteeUsername);
            if (invitee == null)
            {
                throw new Exception("Пользователь не найден");
            }

            var invitation = new WishListInvitationEntity
            {
                RequesterId = requesterId.ToString(),
                InviteeId = invitee.Id.ToString(),
                Token = Guid.NewGuid().ToString(),
                CreatedAt = DateTime.UtcNow,
                IsAccepted = false
            };

            context.WishListInvitations.Add(invitation);
            await context.SaveChangesAsync();

            return "Приглашение создано";
        }

        public async Task<PendingResultDto> GetPendingInvitation(Guid userId)
        {
            var invitation = await context.WishListInvitations
                .FirstOrDefaultAsync(i => i.InviteeId == userId.ToString() && !i.IsAccepted);

            if (invitation == null)
            {
                return new PendingResultDto
                {
                    Exists = false
                };
            }
            return new PendingResultDto
            {
                Exists = true,
                InvitationId = invitation.Id
            };
        }

        public async Task<string> RejectInvitation(RejectInvitationRequestDTO request, Guid userId)
        {
            var invitation = await context.WishListInvitations
                .FirstOrDefaultAsync(i => i.Id.ToString() == request.InvitationId && i.InviteeId == userId.ToString());

            if (invitation == null)
            {
                throw new Exception("Приглашение не найдено");
            }

            context.WishListInvitations.Remove(invitation);
            await context.SaveChangesAsync();

            return "Приглашение отменено";
        }

    }
}
