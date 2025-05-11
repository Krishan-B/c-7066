
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { TradePanelProvider } from "@/components/trade/TradePanelProvider";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Markets from "@/pages/Markets";
import Portfolio from "@/pages/Portfolio";
import Orders from "@/pages/Orders";
import Wallet from "@/pages/Wallet";
import Account from "@/pages/Account";
import ProfilePage from "@/pages/ProfilePage";
import Landing from "@/pages/Landing";

export default function App() {
  return (
    <AuthProvider>
      <TradePanelProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="markets" element={<Markets />} />
              <Route path="portfolio" element={<ProtectedRoute element={<Portfolio />} />} />
              <Route path="orders" element={<ProtectedRoute element={<Orders />} />} />
              <Route path="wallet" element={<ProtectedRoute element={<Wallet />} />} />
              <Route path="account" element={<ProtectedRoute element={<Account />} />} />
              <Route path="profile" element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/landing" element={<Landing />} />
          </Routes>
        </Router>
        <Toaster />
      </TradePanelProvider>
    </AuthProvider>
  );
}
