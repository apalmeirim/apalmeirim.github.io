import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const getStoredPreference = () => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('wave-theme');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return true;
  };

  const [isDark, setIsDark] = useState(getStoredPreference);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('dark-mode');
    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('wave-theme', isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
    }),
    [isDark, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
