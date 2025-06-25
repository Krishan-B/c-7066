import "./sentry.client";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { checkSupabaseHealth } from "@/integrations/supabase/healthCheck";

// Create a client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Run Supabase health check on startup
checkSupabaseHealth().then((healthy) => {
  if (!healthy) {
    // You can replace this with a UI notification if desired
    console.warn(
      "Warning: Supabase connection failed. Some features may not work."
    );
  }
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
