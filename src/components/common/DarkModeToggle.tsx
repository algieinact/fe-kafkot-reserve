import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "../../icons";

export default function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    // Check for saved preference or system preference on mount
    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const isDark = savedMode ? savedMode === "true" : prefersDark;
        setDarkMode(isDark);

        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", String(newMode));

        if (newMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {darkMode ? (
                <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
                <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
        </button>
    );
}
