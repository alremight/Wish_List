import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from '../../services/loginUser';
import ThemeSwitcher from '../../components/ThemeSwitcher';


function Login() {

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
    
        try {
            const result = await loginUser(formData);
            console.log("Login result:", result); 

        
        sessionStorage.setItem('Username', result.userName); 

    
            toast.success(result.message || "Вы успешно вошли!", {
                position: "bottom-center",
                autoClose: 1000,
            });
            setTimeout(() => {
                navigate("/home");
            }, 1500);
        } catch (error) {
            toast.error(error.message || "Ошибка входа!", {
                position: "bottom-center",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`relative min-h-screen bg-gray-100 dark:bg-black`}>
            <div className="absolute top-4 left-4">
                <ThemeSwitcher />
            </div>
            <div className={`flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black`}>

                <div className="bg-white dark:bg-gray-900 p-9 rounded-3xl shadow-lg w-1/2 max-w-md   ">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Авторизация</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                                Электронная почта *
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Введите вашу почту"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 border  rounded-md shadow-sm focus:ring-blue-500 border-gray-300 focus:border-blue-500 sm:text-sm dark:border-gray-800 dark:bg-gray-800 dark:text-white" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                                Пароль *
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Введите ваш пароль"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-gray-800 dark:bg-gray-800 dark:text-white" />
                        </div>

                        <button
                            type="submit"
                            className="  w-full py-2 px-6 bg-black text-white rounded-lg hover:bg-blue-400 dark:hover:bg-slate-500 dark:bg-gray-800 transition duration-150 text-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? "Авторизация..." : "Войти"}
                        </button>

                    </form>
                    <p className="text-red-600 font-semibold text-xl py-2">{message}</p>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Еще нет аккаунт?{" "}
                            <Link
                                to="/auth/register"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Регистрация
                            </Link>
                        </p>
                    </div>


                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Login;