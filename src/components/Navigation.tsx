
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger, 
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu";
import { 
  Menu, 
  Search, 
  Bell, 
  UserCircle, 
  LogOut, 
  LayoutDashboard, 
  LineChart, 
  CircleDollarSign, 
  Wallet
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  onMenuToggle?: () => void;
}

const Navigation = ({ onMenuToggle }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b border-secondary sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              toggleMobileMenu();
              onMenuToggle?.();
            }}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center">
            <LineChart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold ml-2">TradePro</h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle({ className: isActive("/") ? "bg-accent" : "" })}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/markets">
                  <NavigationMenuLink className={navigationMenuTriggerStyle({ className: isActive("/markets") ? "bg-accent" : "" })}>
                    Markets
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/portfolio">
                  <NavigationMenuLink className={navigationMenuTriggerStyle({ className: isActive("/portfolio") ? "bg-accent" : "" })}>
                    Portfolio
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/orders">
                  <NavigationMenuLink className={navigationMenuTriggerStyle({ className: isActive("/orders") ? "bg-accent" : "" })}>
                    Orders
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-b border-secondary shadow-lg z-50 md:hidden">
            <nav className="flex flex-col p-4">
              <Link to="/" className="py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/markets" className="py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Markets
              </Link>
              <Link to="/portfolio" className="py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Portfolio
              </Link>
              <Link to="/orders" className="py-2 px-4 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                Orders
              </Link>
            </nav>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          {user ? (
            <>
              <span className="text-sm hidden md:block">{user.email}</span>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <UserCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')} size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
