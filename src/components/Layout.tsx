
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import Navigation from "@/components/Navigation";
import KYCVerificationBanner from "@/components/kyc/KYCVerificationBanner";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <KYCVerificationBanner />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
