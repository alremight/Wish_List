namespace WishList.DataAccess.Postgres.Models
{

    public class CreateEditWishDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
