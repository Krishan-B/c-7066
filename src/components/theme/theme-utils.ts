import React from "react";

// Types
export type Theme = "dark" | "light";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the context with undefined as default value
export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Function to get initial theme
export function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches 
      ? "dark" 
      : "light";
  }
  
  return "dark"; // Default theme
}

// Function to apply theme to document
export function applyThemeToDOM(theme: Theme): void {
  if (typeof window !== "undefined") {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    localStorage.setItem("theme", theme);
  }
}
