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
      <SheetContent side="left" className="pr-0 bg-background">
        <SheetHeader className="text-left">
          <SheetTitle>TradePro</SheetTitle>
          <SheetDescription>
            Account Information
          </SheetDescription>
        </SheetHeader>
        
        {user && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">$0.00</span>
                  <span className="text-base font-semibold">Buying Power</span>
                </div>
                <p className="text-xs text-muted-foreground">Your available margin multiplied by the maximum leverage rate of your trading account.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-success">$250.00</span>
                  <span className="text-base font-semibold">Unrealized P&L</span>
                </div>
                <p className="text-xs text-muted-foreground">Total profit and loss from your open positions in your trading account.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-success">$750.00</span>
                  <span className="text-base font-semibold">Realized P&L</span>
                </div>
                <p className="text-xs text-muted-foreground">Total profit and loss from your closed positions in your trading account.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">$10,000.00</span>
                  <span className="text-base font-semibold">Balance</span>
                </div>
                <p className="text-xs text-muted-foreground">Your deposits and the realized P&L in your trading account.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">$8,800.00</span>
                  <span className="text-base font-semibold">Available</span>
                </div>
                <p className="text-xs text-muted-foreground">The amount of funds in your trading account that you can use to open new or additional trades.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">$1,200.00</span>
                  <span className="text-base font-semibold">Used</span>
                </div>
                <p className="text-xs text-muted-foreground">The amount of funds in your trading account that is held to keep your existing positions open.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">$12,000.00</span>
                  <span className="text-base font-semibold">Exposure</span>
                </div>
                <p className="text-xs text-muted-foreground">The current market value of your open position multiplied by the position size converted to your trading account currency.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">85%</span>
                  <span className="text-base font-semibold">Margin Level</span>
                </div>
                <p className="text-xs text-muted-foreground">Indicates whether there are sufficient funds to keep your positions open in your trading account. When your margin level drops below 1%, you will be notified.</p>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">$10,250.00</span>
                  <span className="text-base font-semibold">Account Equity</span>
                </div>
                <p className="text-xs text-muted-foreground">The sum of your balance and unrealized P&L.</p>
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
