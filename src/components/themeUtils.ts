import { ErrorHandler } from "@/services/errorHandling";

export const getInitialTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    try {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light";
      if (savedTheme) {
        return savedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (error) {
      ErrorHandler.handleError({
        code: "data_fetch_error",
        message: "Failed to load theme preference",
        details: error,
        retryable: false,
      });
      return "dark"; // Fallback to default theme on error
    }
  }

  return "dark"; // Default theme
};
