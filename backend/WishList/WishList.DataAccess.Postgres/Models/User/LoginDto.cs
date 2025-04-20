namespace WishList.DataAccess.Postgres.Models.User;

public record LoginDto
{
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}
