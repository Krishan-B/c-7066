export interface NavigationProps {
  onMenuToggle: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
}

export interface NavItemProps {
  icon: React.ElementType;
  href: string;
  label: string;
  active?: boolean;
}
