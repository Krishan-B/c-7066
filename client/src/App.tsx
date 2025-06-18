import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AuthProvider } from './components/AuthProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/theme';
import { TradePanelProvider } from './components/trade/TradePanelProvider';
import { LoadingFallback } from './components/ui/loading-fallback';
import { Toaster } from './components/ui/toaster';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Index from './pages/Index';
// Critical components that should be eagerly loaded
import Landing from './pages/Landing';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; // Import PrivacyPolicyPage
import UpdatePasswordPage from './pages/UpdatePasswordPage'; // Import the new page

import { preloadRoutes } from './utils/routePreload';

// Lazy loaded page components with route-based chunking
const Markets = lazy(() => import(/* webpackChunkName: "markets" */ './pages/Markets'));
const Portfolio = lazy(() => import(/* webpackChunkName: "portfolio" */ './pages/Portfolio'));
const Orders = lazy(() => import(/* webpackChunkName: "orders" */ './pages/Orders'));
const News = lazy(() => import(/* webpackChunkName: "news" */ './pages/News'));
const Wallet = lazy(() => import(/* webpackChunkName: "wallet" */ './pages/Wallet'));
const Account = lazy(() => import(/* webpackChunkName: "account" */ './pages/Account'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const KYCPage = lazy(() => import('./pages/KYCPage'));

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
                {/* OAuth callback page */}
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Password Update page */}
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                {/* Privacy Policy page */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

                {/* Protected routes inside Layout */}
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route
                    path="markets"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Markets />
                      </Suspense>
                    }
                  />
                  <Route
                    path="portfolio"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProtectedRoute>
                          <Portfolio />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  />
                  <Route
                    path="news"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <News />
                      </Suspense>
                    }
                  />
                  <Route
                    path="wallet"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProtectedRoute>
                          <Wallet />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  />
                  <Route
                    path="account"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  />
                  <Route
                    path="kyc"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProtectedRoute>
                          <KYCPage />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
            <Toaster />
          </TradePanelProvider>{' '}
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
