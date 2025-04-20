import React from "react";
import useTheme from "./useTheme.js";

const ThemeSwitcher = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-md text-sm text-white bg-gray-800 hover:bg-blue-400 dark:bg-gray-700 dark:hover:bg-slate-500 transition"
        >
            {isDarkMode ? "Светлая тема" : "Тёмная тема"}
        </button>
    );
};

export default ThemeSwitcher;