import axios from "axios";

export async function registerUser(userData) {
    try {
        const response = await axios.post("http://localhost:5152/User/register", {
            userName: userData.userName,
            passwordHash: userData.password,
            email: userData.email,
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Проблема со стороны сервера!"
        );
    }
}