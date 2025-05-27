
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { preloadRoutes } from "@/utils/routePreload";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { TradePanelProvider } from "@/components/trade/TradePanelProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";

// Critical components that should be eagerly loaded
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

// Lazy loaded page components with route-based chunking
const Markets = lazy(() => import(/* webpackChunkName: "markets" */ "@/pages/Markets"));
const Portfolio = lazy(() => import(/* webpackChunkName: "portfolio" */ "@/pages/Portfolio"));
const Orders = lazy(() => import(/* webpackChunkName: "orders" */ "@/pages/Orders"));
const News = lazy(() => import(/* webpackChunkName: "news" */ "@/pages/News"));
const Wallet = lazy(() => import(/* webpackChunkName: "wallet" */ "@/pages/Wallet"));
const Account = lazy(() => import(/* webpackChunkName: "account" */ "@/pages/Account"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

export default function App() {
  useEffect(() => {
    // Start preloading common routes after initial render
    preloadRoutes();
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <TradePanelProvider>
            <Router>
              <Routes>
                {/* Landing page is now the root */}
                <Route path="/" element={<Landing />} />
                {/* Auth page */}
                <Route path="/auth" element={<Auth />} />
                {/* Protected routes inside Layout */}
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="markets" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Markets />
                    </Suspense>
                  } />
                  <Route path="portfolio" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute><Portfolio /></ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="orders" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute><Orders /></ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="news" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <News />
                    </Suspense>
                  } />
                  <Route path="wallet" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute><Wallet /></ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="account" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute><Account /></ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    </Suspense>
                  } />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
            <Toaster />
          </TradePanelProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
