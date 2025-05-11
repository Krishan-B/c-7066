
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, LineChart, BarChart3, Newspaper, ShoppingCart, Wallet, Settings, UserCircle, LogOut, ListCheck } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem = ({ to, icon, label }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center py-2 px-4 rounded-md text-sm transition-colors",
      isActive 
        ? "bg-accent text-accent-foreground font-medium" 
        : "hover:bg-accent/50 text-muted-foreground"
    )}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
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
      navigate("/auth");
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
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background z-10 w-64 border-r border-secondary transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex-grow">
          <nav className="space-y-1">
            <SidebarItem to="/" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
            <SidebarItem to="/markets" icon={<LineChart className="h-5 w-5" />} label="Markets" />
            <SidebarItem to="/portfolio" icon={<BarChart3 className="h-5 w-5" />} label="Portfolio" />
            <SidebarItem to="/orders" icon={<ListCheck className="h-5 w-5" />} label="Orders" />
            <SidebarItem to="/news" icon={<Newspaper className="h-5 w-5" />} label="News" />
            <SidebarItem to="/wallet" icon={<Wallet className="h-5 w-5" />} label="Wallet" />
          </nav>
          
          <div className="mt-8">
            <p className="px-4 text-xs font-medium text-muted-foreground mb-2">ACCOUNT</p>
            <nav className="space-y-1">
              <SidebarItem to="/profile" icon={<UserCircle className="h-5 w-5" />} label="My Profile" />
              <SidebarItem to="/account" icon={<Settings className="h-5 w-5" />} label="Settings" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center py-2 px-4 rounded-md text-sm text-muted-foreground hover:bg-accent/50 transition-colors text-left"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
