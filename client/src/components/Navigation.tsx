import { Bell, Menu } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

import ApplicationLogo from './navigation/ApplicationLogo';
import MainNav from './navigation/MainNav';
import MobileMenu from './navigation/MobileMenu';
import UserMenu from './navigation/UserMenu';
import { ThemeSwitcher } from './theme/ThemeSwitcher';
import { Button } from './ui/button';

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
    <div className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="mr-2 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <ApplicationLogo />
        <MainNav className="mx-6 hidden flex-1 md:flex" />
        <nav className="flex items-center space-x-2">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationClick}
            className="mr-2 transition-colors hover:bg-primary/10 hover:text-primary"
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
