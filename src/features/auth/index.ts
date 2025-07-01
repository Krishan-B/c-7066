/**
 * Auth Feature Index
 *
 * This file exports all auth-related components, hooks, and utilities
 * for easier importing throughout the application.
 */

// Context & Components
export { AuthContext, type AuthContextType } from "./context/AuthContext";
export { AuthProvider } from "./context/AuthProvider";

// Components
export { ProtectedRoute } from "./components/ProtectedRoute";
// Export existing components
export { default as LoginForm } from "./components/LoginForm";
export { default as RegisterForm } from "./components/RegisterForm";
export { default as PasswordResetDialog } from "./components/PasswordResetDialog";

// Pages
export { default as AuthPage } from "./AuthPage";
