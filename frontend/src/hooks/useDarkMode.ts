import { useState, useCallback } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = sessionStorage.getItem("darkmode");
    const dark = stored === "true";
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    return dark;
  });

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        sessionStorage.setItem("darkmode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        sessionStorage.setItem("darkmode", "false");
      }
      return newMode;
    });
  }, []);

  return { isDark, toggleDarkMode };
}
