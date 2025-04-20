namespace WishList.DataAccess.Postgres.Entity;

public class WishEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string ImagePath { get; set; }
    public string Link { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; }
    public DateTime Created { get; set; }
    public Guid WishListId { get; set; }
    public virtual WishListEntity WishList { get; set; }
    public Guid CreatedById { get; set; } // Новое поле
    public virtual UserEntity CreatedBy { get; set; } // Навигационное свойство
}