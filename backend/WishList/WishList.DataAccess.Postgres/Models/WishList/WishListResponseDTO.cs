
namespace WishList.DataAccess.Postgres.Models.WishList 
{
    public class WishListResponseDto
    {
        public Dictionary<string, List<WishDTO>> UserWishes { get; set; } = new Dictionary<string, List<WishDTO>>();
    }
}


