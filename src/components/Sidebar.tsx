
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Briefcase,
  FileText,
  Settings,
  PieChart,
  Calculator,
  X,
  ChevronDown,
  ChevronRight,
  Activity
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems = [
    {
      title: "Markets",
      href: "/markets",
      icon: TrendingUp,
      description: "Live market data and watchlists"
    },
    {
      title: "Trading",
      href: "/trading",
      icon: Activity,
      description: "Place orders and manage trades"
    },
    {
      title: "Portfolio",
      href: "/portfolio",
      icon: Briefcase,
      description: "Your holdings and performance"
    },
    {
      title: "Orders",
      href: "/orders",
      icon: FileText,
      description: "Order history and management"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      description: "Performance analytics and reports",
      submenu: [
        { title: "Performance", href: "/analytics/performance" },
        { title: "Risk Metrics", href: "/analytics/risk" },
        { title: "Reports", href: "/analytics/reports" }
      ]
    },
    {
      title: "Leverage",
      href: "/leverage",
      icon: Calculator,
      description: "Leverage calculator and margin tools"
    },
    {
      title: "Account",
      href: "/account",
      icon: Settings,
      description: "Account settings and preferences"
    }
  ];

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: "tween", duration: 0.3 }}
          className={cn(
            "fixed left-0 top-16 z-10 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "md:relative md:top-0 md:h-screen md:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const isExpanded = expandedItems.includes(item.title);
                  const hasSubmenu = item.submenu && item.submenu.length > 0;

                  return (
                    <li key={item.title}>
                      <div
                        className={cn(
                          "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 flex-1"
                        >
                          <item.icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-xs opacity-70">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                        
                        {hasSubmenu && (
                          <button
                            onClick={() => toggleExpanded(item.title)}
                            className="ml-2 p-1 hover:bg-accent rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Submenu */}
                      {hasSubmenu && isExpanded && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 mt-1 space-y-1 border-l pl-4"
                        >
                          {item.submenu!.map((subItem) => (
                            <li key={subItem.href}>
                              <Link
                                to={subItem.href}
                                className={cn(
                                  "block rounded-md px-3 py-1 text-sm transition-colors",
                                  location.pathname === subItem.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
              <p className="text-xs text-muted-foreground">
                Trading Platform v1.0
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
