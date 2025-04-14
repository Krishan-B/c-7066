
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  CircleDollarSign,
  BarChart2,
  Star,
  RefreshCw,
  Settings,
  Plus
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Markets", icon: LineChart, path: "/markets" },
    { name: "Portfolio", icon: Wallet, path: "/portfolio" },
    { name: "Orders", icon: CircleDollarSign, path: "/orders" },
    { name: "Transactions", icon: RefreshCw, path: "/transactions" },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-64 border-r border-secondary bg-background fixed inset-y-0 top-[65px] z-40 hidden md:block">
      <div className="py-4 h-full flex flex-col">
        <div className="px-4 py-3">
          <div className="glass-card rounded-lg p-4 mb-4">
            <div className="text-xs text-muted-foreground mb-1">Total Balance</div>
            <div className="text-xl font-bold">$24,692.57</div>
            <div className="text-success text-xs flex items-center mt-1">
              <LineChart className="w-3 h-3 mr-1" />
              +5.23% today
            </div>
          </div>
        </div>
        
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={item.path}>
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="mt-auto px-4 pb-4">
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> 
            Deposit Funds
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
