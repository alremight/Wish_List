using WishList.DataAccess.Postgres.Models.WishList;

namespace WishList.API.Abstraction
{
    public interface IWishListService
    {
        Task<WishListCheckResult> CheckWishList(Guid UserId);
    }
}
