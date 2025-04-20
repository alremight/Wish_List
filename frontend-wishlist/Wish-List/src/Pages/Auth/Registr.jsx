import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerUser } from '../../services/registerUser';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import './Registr.css';



function Register() {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const navigate = useNavigate(); 
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const result = await registerUser(formData); 
            toast.success(result.message || "Вы успешно зарегистрировались!", {
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
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center" >Регистрация</h1>
                    <form onSubmit={handleSubmit} className=" space-y-10">

                        {/* <label className="block text-sm font-medium 
                            text-gray-700 
                            dark:text-gray-300" htmlFor="userName">
                                Имя пользователя *
                            </label>
                            <input
                                type="text"
                                name="userName"
                                id="userName"
                                placeholder="Введите ваше имя"
                                value={formData.userName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 border  rounded-md shadow-sm sm:text-sm
                            border-gray-300
                            focus:ring-blue-500 
                            focus:border-blue-500  
                            dark:border-gray-800
                            dark:bg-gray-800 
                            dark:text-white"
                            />  */}
                        {/* <div className="form__group field">
                                <input type="input" class="form__field" placeholder="Name" required="" />
                                <label for="name" class="form__label">Name</label>
                            </div> */}
                        <div className="input-container">
                            <input
                                type="text"
                                name="userName"
                                id="input"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                                className="
                                    focus:ring-blue-500 
                                    border-gray-300 
                                    focus:border-blue-500 sm:text-sm 
                                    dark:border-gray-800 
                                    dark:bg-gray-800 
                                    dark:text-white"
                            />
                            <div className=" label">
                                <label htmlFor="input" className="text-gray-800 dark:text-gray-300">Username*</label>
                            </div>
                            <div className="underline" />
                        </div>

                        <div className="input-container">
                            <input
                                type="text"
                                name="email"
                                id="input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="
                                focus:ring-blue-500 
                                border-gray-300 
                                focus:border-blue-500 sm:text-sm 
                                dark:border-gray-800 
                                dark:bg-gray-800 
                                dark:text-white" />
                            <div className=" label">
                                <label htmlFor="input" className="text-gray-800 dark:text-gray-300">Email*</label>
                            </div>
                            <div className="underline" />
                        </div>

                        {/* <div>
                            <label className="text-gray-700 dark:text-gray-300" htmlFor="password">
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
                        </div> */}
                        <div className="input-container">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="
                                focus:ring-blue-500 
                                border-gray-300 
                                focus:border-blue-500 sm:text-sm 
                                dark:border-gray-800 
                                dark:bg-gray-800 
                                dark:text-white" />
                            <div  className="label">
                                <label htmlFor="password" className="text-gray-800 dark:text-gray-300">Password*</label>
                            </div>
                            <div className="underline" />
                        </div>

                        <button
                            type="submit"
                            className="  w-full py-2 px-6 bg-black text-white rounded-lg hover:bg-blue-400 dark:hover:bg-slate-500 dark:bg-gray-800 transition duration-150 text-lg"
                            disabled={isLoading}
                        >

                            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                        </button>

                    </form>
                    <p className="text-red-600 font-semibold text-xl py-2">{message}</p>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Уже есть аккаунт?{" "}
                            <Link
                                to="/auth/login"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Register;
