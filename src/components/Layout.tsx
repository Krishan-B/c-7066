import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Navigation } from '@/components/Navigation';
import KYCVerificationBanner from '@/components/kyc/KYCVerificationBanner';
import { motion } from 'framer-motion';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <KYCVerificationBanner />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <motion.main
          className={`flex-1 overflow-auto bg-background transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
