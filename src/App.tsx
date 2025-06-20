
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { TradePanelProvider } from "./components/trade/TradePanelProvider";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import Orders from "./pages/Orders";
import Wallet from "./pages/Wallet";
import News from "./pages/News";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import Account from "./pages/Account";
import KYC from "./pages/KYC";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Index />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/markets" element={
                    <ProtectedRoute>
                      <Layout>
                        <Markets />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/portfolio" element={
                    <ProtectedRoute>
                      <Layout>
                        <Portfolio />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Layout>
                        <Orders />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <Layout>
                        <Wallet />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/news" element={
                    <ProtectedRoute>
                      <Layout>
                        <News />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/account" element={
                    <ProtectedRoute>
                      <Layout>
                        <Account />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/kyc" element={
                    <ProtectedRoute>
                      <Layout>
                        <KYC />
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TradePanelProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
