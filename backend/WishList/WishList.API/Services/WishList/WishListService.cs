using WishList.API.Abstraction;
using Microsoft.EntityFrameworkCore;
using WishList.DataAccess.Postgres;
using WishList.DataAccess.Postgres.Models.WishList;

namespace WishList.API.Services.WishList
{
    public class WishListService(WishListDbContext context) : IWishListService
    {
        public async Task<WishListCheckResult> CheckWishList(Guid UserId)
        {
            var wishList = await context.WishLists
                .Include(wl => wl.Users)
                .FirstOrDefaultAsync(wl => wl.Users.Any(u => u.Id == UserId));


            return new WishListCheckResult
            {
                WishListExists = wishList != null,
                WishListId = wishList?.Id,
            };
        }
    }
}
