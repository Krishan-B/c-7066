import ApplicationLogo from './navigation/ApplicationLogo';
import MainNav from './navigation/MainNav';
import UserMenu from './navigation/UserMenu';
import MobileMenu from './navigation/MobileMenu';
import { Bell, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from './theme/ThemeSwitcher';

interface NavigationProps {
  readonly onMenuToggle?: () => void;
  readonly onToggleSidebar?: () => void;
}

export function Navigation({ onMenuToggle, onToggleSidebar }: NavigationProps) {
  const { toast } = useToast();

  const handleNotificationClick = () => {
    toast({
      title: 'Notifications',
      description: 'No new notifications at this time',
    });
  };

  return (
    <div className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center px-4">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="mr-2 hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <ApplicationLogo />
        <MainNav className="mx-6 flex-1 hidden md:flex" />
        <nav className="flex items-center space-x-2">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationClick}
            className="mr-2 hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <UserMenu />
          <MobileMenu onMenuToggle={onMenuToggle} />
        </nav>
      </div>
    </div>
  );
}
