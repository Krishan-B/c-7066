export const getInitialTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "dark"; // Default theme
};
