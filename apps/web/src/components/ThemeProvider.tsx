import { createContext, useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProviderContext = createContext<{ theme: "dark" }>({
  theme: "dark",
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme: "dark" }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
