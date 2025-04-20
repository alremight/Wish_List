namespace WishList.DataAccess.Postgres.Entity;

public class WishListEntity
{
    public Guid Id {  get; set; }

    public string WishListName { get; set; } = string.Empty;

    public List<UserEntity> Users { get; set; } = new List<UserEntity>();
    public List<WishEntity> Wishes { get; set; } = new List<WishEntity>();

}

