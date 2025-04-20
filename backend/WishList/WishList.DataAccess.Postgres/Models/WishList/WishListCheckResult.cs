
namespace WishList.DataAccess.Postgres.Models.WishList
{
    public class WishListCheckResult
    {
        public bool WishListExists { get; set; }
        public Guid?  WishListId { get; set; }
    }
}
