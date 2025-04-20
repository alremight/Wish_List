import axios from "axios";

axios.defaults.withCredentials = true;
export async function loginUser(userData) {
    try {
        const response = await axios.post("http://localhost:5152/User/login", {
            userName: userData.userName,
            email: userData.email,
            passwordHash: userData.password,
        });

        return response.data; 
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Проблема со стороны сервера!"
        );
    }
}