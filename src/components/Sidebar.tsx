import { motion } from 'framer-motion';
import {
  BarChart3,
  LayoutDashboard,
  LineChart,
  ListCheck,
  LogOut,
  Newspaper,
  Settings,
  UserCircle,
  Wallet,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { preloadRoute } from '@/utils/routePreload';

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  delay?: number;
  onMouseEnter?: () => void;
}

const SidebarItem = ({ to, icon, label, delay = 0, onMouseEnter }: SidebarItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, delay }}
  >
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-md px-4 py-2 text-sm transition-all duration-300',
          isActive
            ? 'bg-primary/20 font-medium text-primary'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )
      }
      onMouseEnter={onMouseEnter}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  </motion.div>
);

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out',
        variant: 'destructive',
      });
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-10 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background shadow-lg transition-all duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex-grow">
          <nav className="space-y-1">
            <SidebarItem
              to="/dashboard"
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Dashboard"
              delay={0.1}
            />
            <SidebarItem
              to="/dashboard/markets"
              icon={<LineChart className="h-5 w-5" />}
              label="Markets"
              delay={0.2}
              onMouseEnter={() => preloadRoute('markets')}
            />
            <SidebarItem
              to="/dashboard/portfolio"
              icon={<BarChart3 className="h-5 w-5" />}
              label="Portfolio"
              delay={0.3}
              onMouseEnter={() => preloadRoute('portfolio')}
              data-route="portfolio"
            />
            <SidebarItem
              to="/dashboard/orders"
              icon={<ListCheck className="h-5 w-5" />}
              label="Orders"
              delay={0.4}
              onMouseEnter={() => preloadRoute('orders')}
              data-route="orders"
            />
            <SidebarItem
              to="/dashboard/news"
              icon={<Newspaper className="h-5 w-5" />}
              label="News"
              delay={0.5}
              onMouseEnter={() => preloadRoute('news')}
              data-route="news"
            />
            <SidebarItem
              to="/dashboard/wallet"
              icon={<Wallet className="h-5 w-5" />}
              label="Wallet"
              delay={0.6}
              onMouseEnter={() => preloadRoute('wallet')}
              data-route="wallet"
            />
          </nav>

          <div className="mt-8">
            <p className="mb-2 px-4 text-xs font-medium text-primary">ACCOUNT</p>
            <nav className="space-y-1">
              <SidebarItem
                to="/dashboard/profile"
                icon={<UserCircle className="h-5 w-5" />}
                label="My Profile"
                delay={0.7}
              />
              <SidebarItem
                to="/dashboard/account"
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                delay={0.8}
              />
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.9 }}
                onClick={handleLogout}
                className="flex w-full items-center rounded-md px-4 py-2 text-left text-sm text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </motion.button>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
