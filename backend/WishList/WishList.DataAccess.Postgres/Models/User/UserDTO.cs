namespace WishList.DataAccess.Postgres.Models.User;

public class UserDTO()
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Gender { get; set; }
    public string PasswordHash { get; set; }
    public string Email { get; set; }
    public DateTime RegistrationDate = DateTime.UtcNow;
    public int CountWishList { get; set; }
}

