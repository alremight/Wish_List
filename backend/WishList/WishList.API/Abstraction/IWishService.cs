using System.Security.Claims;
using WishList.DataAccess.Postgres;
using WishList.DataAccess.Postgres.Models;
using WishList.DataAccess.Postgres.Models.WishList;

namespace WishList.API.Abstraction
{
    public interface IWishService
    {
        Task<WishDTO> Create(CreateEditWishDTO createDTO, IFormFile imageFile, Guid userId);
        Task<List<WishDTO>> GetAllWish();
        Task<List<WishDTO>> GetUserWishes(Guid Id);
        Task<WishDTO> Edit(CreateEditWishDTO editDTO, Guid wishId);
        Task<string> Delete(Guid wishId);
        Task<WishListResponseDto> GetWishesByWishListId(Guid wishListId);
    }
}
