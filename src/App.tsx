import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { TradePanelProvider } from "./components/trade/TradePanelProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
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

function App() {
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
                        <Layout>
                          <Index />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/markets"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Markets />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/portfolio"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Portfolio />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/enhanced-orders"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <EnhancedOrders />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/wallet"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Wallet />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/news"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <News />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/analytics"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Analytics />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ProfilePage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/account"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Account />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/kyc"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <KYC />
                        </Layout>
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
