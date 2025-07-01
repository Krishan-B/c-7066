import { Toaster } from "./shared/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "./shared/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./features/auth";
import { ThemeProvider } from "./features/theme";
import { TradePanelProvider } from "./features/trading/components/TradePanelProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainLayout } from "./layouts";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import EnhancedOrders from "./pages/EnhancedOrders";
import Wallet from "./pages/Wallet";
import News from "./pages/News";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import Account from "./pages/Account";
import KYC from "./pages/KYC";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Orders from "./pages/Orders";
import { useEffect, useRef } from "react";
import { checkApiHealth } from "./shared/services/api/checkApiHealth";

function App() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const runHealthCheck = async () => {
      if (document.visibilityState === "visible") {
        await checkApiHealth();
      }
    };
    runHealthCheck();
    const onVisibility = () => {
      if (document.visibilityState === "visible") runHealthCheck();
    };
    document.addEventListener("visibilitychange", onVisibility);
    intervalRef.current = setInterval(runHealthCheck, 15000); // every 15s
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <TradePanelProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Index />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/markets"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Markets />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/portfolio"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Portfolio />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/enhanced-orders"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <EnhancedOrders />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/wallet"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Wallet />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/news"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <News />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/analytics"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Analytics />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/profile"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <ProfilePage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/account"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Account />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/kyc"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <KYC />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/kyc"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <KYC />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/orders"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Orders />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TradePanelProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
