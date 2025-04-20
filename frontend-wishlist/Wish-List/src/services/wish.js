import axios from "axios";

axios.defaults.withCredentials = true;

export const fetchDefaultWishListId = async (navigate) => {
  try {
      const response = await axios.get('http://localhost:5152/wishlist/check'); 
      if (response.data && response.data.wishListId) {
          console.log("DefaultWishListId получен:", response.data.wishListId);
          return response.data.wishListId; 
      } else {
          console.error("Не удалось получить DefaultWishListId:", response.data);
          return null;
      }
  } catch (e) {
      if (e.response && e.response.status === 401) {
          console.error("Ошибка авторизации (fetchDefaultWishListId - 401), перенаправляем на страницу входа");
          navigate("/auth/login"); 
           return null; 
      }
      console.error("Ошибка при получении DefaultWishListId:", e);
      return null;
  }
};



export const createWish = async (formData) => {
    try {
        const response = await axios.post("http://localhost:5152/Wish", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Wish created successfully:", response.data);
        return response.data;
    } catch (e) {
        if (e.response && e.response.data) {
            console.error("Ошибка валидации:", e.response.data);
            throw new Error(`Ошибка валидации: ${JSON.stringify(e.response.data)}`);
        } else {
            console.error("Произошла ошибка:", e.message);
            throw new Error(`Ошибка: ${e.message}`);
        }
    }
};

export const fetchWish = async (navigate, wishListId) => {
    try {
        const response = await axios.get(`http://localhost:5152/Wish/${wishListId}`);
        if (response.data && response.data.userWishes) {
            console.log("Данные от API (fetchWish):", response.data);
            return response.data.userWishes;
        } else {
            console.error("Некорректный формат данных от API (fetchWish):", response.data);
            return {};
        }
    } catch (e) {
        if (e.code === "ERR_NETWORK" || e.message.includes("ERR_CONNECTION_REFUSED")) {
            console.error("Сервер недоступен (fetchWish - ERR_CONNECTION_REFUSED)");
            navigate("/auth/login");
        } else if (e.response && e.response.status === 401) {
            console.error("Ошибка авторизации (fetchWish - 401), перенаправляем на страницу входа");
            navigate("/auth/login");
        } else {
            console.error("Произошла ошибка в fetchWish:", e.message);
        }
        return {};
    }
};



export const editWish = async (wishId, editData) => {
  try {
    const response = await axios.put(
      `http://localhost:5152/Wish/update-wish?wishId=${wishId}`, 
      editData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error editing wish:', error);
    throw error;
  }
};



export const deleteWish = async (wishId) => {
  const url = `http://localhost:5152/Wish/delete-wish?wishId=${wishId}`;
  try {
    const response = await axios.delete(url, {
      data: { wishId }, 
      headers: {
        "Content-Type": "application/json", 
      },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении желания:", error);
    throw error;
  }
};

