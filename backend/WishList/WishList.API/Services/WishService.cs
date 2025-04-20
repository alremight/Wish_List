using Microsoft.EntityFrameworkCore;
using WishList.API.Abstraction;
using WishList.DataAccess.Postgres.Models;
using WishList.DataAccess.Postgres;
using WishList.DataAccess.Postgres.Entity;
using Mapster;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using WishList.DataAccess.Postgres.Models.WishList;


namespace WishList.API.Services
{
    public class WishService(WishListDbContext context, IDistributedCache distributedcashe) : IWishService
    {
        public async Task<WishDTO> Create(CreateEditWishDTO createDTO, IFormFile imageFile, Guid userId)
        {
            string imagePath = null;
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }
                
                imagePath = $"/uploads/{fileName}";
            }

            var wishList = await context.WishLists
                .Include(wl => wl.Users)
                .Include(wl => wl.Wishes)
                .FirstOrDefaultAsync(wl => wl.Users.Any(u => u.Id == userId));
            if (wishList == null)
            {
                throw new Exception("WishList для данного пользователя не найдена");
            }

            var wish = new WishEntity
            {
                Name = createDTO.Name,
                Price = createDTO.Price,
                Description = createDTO.Description,
                Link = createDTO.Link,
                ImagePath = imagePath,
                CreatedById = userId,
                Created = DateTime.UtcNow,
                WishListId = wishList.Id
            };

            if (string.IsNullOrWhiteSpace(wish.Name))
            {
                throw new Exception("Имя желания не может быть пустым");
            }

            wishList.Wishes.Add(wish);
            await context.SaveChangesAsync();

            return new WishDTO
            {
                Id = wish.Id,
                Name = wish.Name,
                Price = wish.Price,
                Description = wish.Description,
                Link = wish.Link,
                ImagePath = wish.ImagePath,
                Created = wish.Created
            };
        }


        public async Task<List<WishDTO>> GetAllWish()
        {
            var wishEntity = await context.Wishes
                .AsNoTracking()
                .ToListAsync();

            return wishEntity.Select(x => x.Adapt<WishDTO>()).ToList();
        }

        public async Task<List<WishDTO>> GetUserWishes(Guid userId)
        {
            var wishLists = await context.WishLists
                .Include(wl => wl.Wishes)
                .Include(wl => wl.Users)
                .Where(wl => wl.Users.Any(u => u.Id == userId))
                .ToListAsync();

            if (wishLists == null || !wishLists.Any())
            {
                throw new Exception("Для данного пользователя не найден ни один список желаний");
            }

            var wishes = wishLists.SelectMany(wl => wl.Wishes).ToList();

            var wishesDto = wishes.Select(wish => new WishDTO
            {
                Id = wish.Id,
                Name = wish.Name,
                Price = wish.Price,
                Description = wish.Description,
                Link = wish.Link,
                ImagePath = wish.ImagePath != null ? $"http://localhost:5152{wish.ImagePath}" : null,
                Created = wish.Created
            }).ToList();

            return wishesDto;
        }



        public async Task<WishDTO> Edit(CreateEditWishDTO editDTO, Guid wishId)
        {
            var wish = await context.Wishes.FindAsync(wishId);

            if (wish == null)
            {
                throw new Exception("Желание не найдено");
            }

            wish.Name = editDTO.Name ?? wish.Name;
            wish.Price = editDTO.Price;
            wish.Description = editDTO.Description ?? wish.Description;
            wish.Link = editDTO.Link ?? wish.Link;

            await context.SaveChangesAsync();

            return new WishDTO
            {
                Id = wish.Id,
                Name = wish.Name,
                Price = wish.Price,
                Description = wish.Description,
                Link = wish.Link,
                Created = wish.Created
            };
        }

        public async Task<string> Delete(Guid wishId)
        {
            var wish = await context.Wishes.FindAsync(wishId);

            if (wish == null)
            {
                throw new Exception("Желание не найдено");
            }

            if (!string.IsNullOrEmpty(wish.ImagePath))
            {   
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", wish.ImagePath.TrimStart('/'));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            context.Wishes.Remove(wish); 
            await context.SaveChangesAsync();

            return "Желание удалено";
        }

        public async Task<WishListResponseDto> GetWishesByWishListId(Guid wishListId)
        {
            var cacheKey = $"wishlist_{wishListId}";
            var cachedData = await distributedcashe.GetAsync(cacheKey);

            if (cachedData != null)
            {
                return JsonSerializer.Deserialize<WishListResponseDto>(cachedData);
            }
            var wishList = await context.WishLists
                .Include(wl => wl.Wishes)
                .ThenInclude(w => w.CreatedBy)
                .Include(wl => wl.Users)
                .FirstOrDefaultAsync(wl => wl.Id == wishListId);

            if (wishList == null || wishList.Wishes == null || wishList.Users == null)
            {
                return new WishListResponseDto();
            }

            var userWishesMap = new Dictionary<string, List<WishDTO>>();

            foreach (var user in wishList.Users)
            {
                var userWishes = wishList.Wishes
                    .Where(w => w.CreatedById == user.Id)
                    .Select(w => new WishDTO
                    {
                        Id = w.Id,
                        Name = w.Name,
                        ImagePath = w.ImagePath != null ? $"http://localhost:5152{w.ImagePath}" : null,
                        Link = w.Link,
                        Price = w.Price,
                        Description = w.Description,
                        Created = w.Created
                    })
                    .ToList();

                if (userWishes.Any()) 
                {
                    userWishesMap.Add(user.UserName, userWishes);
                }
            }
            var result = new WishListResponseDto
            {
                UserWishes = userWishesMap
            };
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));

            await distributedcashe.SetAsync(cacheKey, JsonSerializer.SerializeToUtf8Bytes(result), cacheOptions);

            return result;
        }
    }
}
