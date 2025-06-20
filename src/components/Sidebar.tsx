
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, LineChart, BarChart3, Newspaper, Wallet, Settings, UserCircle, LogOut, ListCheck, TrendingUp, Play, Plus } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  delay?: number;
}

const SidebarItem = ({ to, icon, label, delay = 0 }: SidebarItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, delay }}
  >
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center py-2 px-4 rounded-md text-sm transition-all duration-300",
        isActive 
          ? "bg-primary/20 text-primary font-medium" 
          : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
      )}
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
        title: "Signed out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out",
        variant: "destructive",
      });
    }
  };
  
  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card/70 backdrop-blur-sm z-10 w-64 border-r border-secondary/50 transition-all duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex-grow">
          <nav className="space-y-1">
            <SidebarItem to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" delay={0.1} />
            <SidebarItem to="/dashboard/markets" icon={<LineChart className="h-5 w-5" />} label="Markets" delay={0.2} />
            <SidebarItem to="/dashboard/portfolio" icon={<BarChart3 className="h-5 w-5" />} label="Portfolio" delay={0.3} />
            <SidebarItem to="/dashboard/orders" icon={<ListCheck className="h-5 w-5" />} label="Orders" delay={0.4} />
            <SidebarItem to="/dashboard/analytics" icon={<TrendingUp className="h-5 w-5" />} label="Analytics" delay={0.5} />
            <SidebarItem to="/dashboard/news" icon={<Newspaper className="h-5 w-5" />} label="News" delay={0.6} />
            <SidebarItem to="/dashboard/wallet" icon={<Wallet className="h-5 w-5" />} label="Wallet" delay={0.7} />
          </nav>
          
          <div className="mt-8">
            <p className="px-4 text-xs font-medium text-primary mb-2">ACCOUNT</p>
            <nav className="space-y-1">
              <SidebarItem to="/dashboard/profile" icon={<UserCircle className="h-5 w-5" />} label="My Profile" delay={0.8} />
              <SidebarItem to="/dashboard/account" icon={<Settings className="h-5 w-5" />} label="Settings" delay={0.9} />
              
              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 1.0 }}
                >
                  <Button 
                    onClick={() => navigate("/dashboard/markets")}
                    className="w-full justify-start bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-300"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Trade Now
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 1.1 }}
                >
                  <Button 
                    onClick={() => navigate("/dashboard/wallet")}
                    variant="outline"
                    className="w-full justify-start hover:border-primary hover:text-primary transition-all duration-300"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </motion.div>
              </div>

              <motion.button 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 1.2 }}
                onClick={handleLogout}
                className="w-full flex items-center py-2 px-4 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 text-left mt-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
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
