namespace WishList.DataAccess.Postgres.Entity;

public class UserEntity
{
    public UserEntity() { }
    public UserEntity(string username, string email, string passwordHash)
    {
        UserName = username;
        Email = email;
        PasswordHash = passwordHash;
    }

    public Guid Id { get; set; }

    public string UserName { get;  set; }

    public string Gender { get; set; } = string.Empty;

    public string PasswordHash { get; set; }

    public string Email { get;  set; }

    public int CountWishList { get; set; }
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;


    public ICollection<WishListEntity> WishLists { get; set; } = [];



}
