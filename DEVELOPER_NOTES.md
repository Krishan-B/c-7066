# Developer Notes

## Recharts Custom Tooltip Best Practice

If you add new recharts charts in the future, simply use:

```tsx
<Tooltip content={<CustomTooltip />} />
```

for consistency, type safety, and a unified user experience.

---

## Context/Provider & Hook Best Practices

- **Separation of Concerns:**
  - Keep provider components, context creation, and custom hooks in  
    separate files for clarity and Fast Refresh compatibility.
  - Example: `ThemeProviderContent.tsx`, `theme-utils.ts`, `use-theme.ts`.

- **Barrel Exports:**
  - Use `index.ts` files to re-export providers and hooks for clean imports.

- **Testing:**
  - Always test context providers by rendering them with a consumer in your tests.
  - For hooks, use `@testing-library/react`'s `renderHook` or similar utilities.
  - Mock browser APIs (e.g., `window.matchMedia`) and wrap with required  
    providers (e.g., `QueryClientProvider` for React Query).

- **Usage Example:**
  - To access theme context:

    ```tsx
    import { useTheme } from '@/components/theme/use-theme';
    const { theme, toggleTheme } = useTheme();
    ```

  - To open the trade panel:

    ```tsx
    import { useTradePanelContext } from '@/components/trade/use-trade-panel';
    const { openTradePanel } = useTradePanelContext();
    openTradePanel();
    ```

- **Add new providers/hooks using this pattern for maintainability and testability.**

---

## Context/Provider Structure Overview

### Main Context/Provider Files & Responsibilities

- `ThemeProvider.tsx` / `theme/`
  - Provides theme state and toggling logic.
  - Exposes `useTheme` hook for accessing and updating theme.
- `TradePanelProvider.tsx` / `trade/`
  - Manages trade panel open/close state and related actions.
  - Exposes `useTradePanelContext` hook for controlling the trade panel.
- `AuthProvider.tsx` / `AuthContext.tsx`
  - Handles authentication state and user session.
  - Exposes `useAuth` and `useAuthProvider` hooks for auth logic.

### Folder & File Structure Best Practices

- Place each context/provider in its own folder (e.g., `theme/`, `trade/`, `auth/`).
- Separate files for:
  - Context creation (e.g., `ThemeContext.ts`)
  - Provider component (e.g., `ThemeProvider.tsx`)
  - Custom hooks (e.g., `useTheme.ts`)
  - Utilities (e.g., `theme-utils.ts`)
- Use an `index.ts` barrel file for clean exports.

### Creating a New Context/Provider (Step-by-Step)

1. Create a new folder under `src/components/` (e.g., `myContext/`).
2. Add files:
   - `MyContext.ts` – create and export the context.
   - `MyProvider.tsx` – provider component with state logic.
   - `useMyContext.ts` – custom hook for consuming the context.
   - `index.ts` – barrel export for provider and hook.
3. Wrap your app (or subtree) with the provider in `App.tsx` or relevant parent.
4. Use the custom hook in child components to access context state/actions.
5. Add tests for provider and hook in `hooks/__tests__/` or similar.

### Naming Conventions

- Context: `XContext` (e.g., `ThemeContext`)
- Provider: `XProvider` (e.g., `ThemeProvider`)
- Hook: `useX` (e.g., `useTheme`)

---

Add other important project-wide notes and best practices here as you discover them.
