
import * as React from "react"
import ApplicationLogo from "./navigation/ApplicationLogo"
import MainNav from "./navigation/MainNav"
import UserMenu from "./navigation/UserMenu"
import MobileMenu from "./navigation/MobileMenu"

interface NavigationProps {
  onMenuToggle?: () => void;
}

export function Navigation({ onMenuToggle }: NavigationProps) {
  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <ApplicationLogo />
        <MainNav className="mx-6" />
        <nav className="flex items-center space-x-1">
          <UserMenu />
          <MobileMenu onMenuToggle={onMenuToggle} />
        </nav>
      </div>
    </div>
  );
}
