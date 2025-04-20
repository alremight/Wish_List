public class WishDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
    public DateTime Created { get; set; }
}



