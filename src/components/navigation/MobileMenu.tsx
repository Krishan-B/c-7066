
import * as React from "react"
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import MobileNavItem from "./MobileNavItem"

interface MobileMenuProps {
  onMenuToggle?: () => void;
}

const MobileMenu = ({ onMenuToggle }: MobileMenuProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/auth");
      setOpen(false);
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="pl-0 ml-2 md:hidden"
          onClick={() => {
            if (onMenuToggle) onMenuToggle();
          }}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className="text-left">
          <SheetTitle>Tradable</SheetTitle>
          <SheetDescription>
            Account Information
          </SheetDescription>
        </SheetHeader>
        
        {user && (
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance:</span>
                <span>$10,000.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Equity:</span>
                <span>$10,250.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unrealized P&L:</span>
                <span className="text-success">$250.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margin Level:</span>
                <span>85%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used Margin:</span>
                <span>$1,200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Realized P&L:</span>
                <span className="text-success">$750.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available:</span>
                <span>$8,800.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exposure:</span>
                <span>$12,000.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus:</span>
                <span>$500.00</span>
              </div>
            </div>
          </div>
        )}

        <Separator />
        <MobileNavItem title="Dashboard" href="/" />
        <MobileNavItem title="Wallet" href="/wallet" />
        <MobileNavItem title="Account" href="/account" />
        <MobileNavItem title="Profile" href="/profile" />
        <Separator />
        {user ? (
          <Button variant="ghost" className="justify-start" onClick={handleLogout}>
            Log Out
          </Button>
        ) : (
          <MobileNavItem title="Sign In" href="/auth?mode=signIn" />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
