
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { motion } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-b border-secondary/40 sticky top-0 z-50 bg-background/95 backdrop-blur"
    >
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <LineChart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">TradePro</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="#features" className="text-sm text-muted-foreground hover:text-foreground nav-link">Features</Link>
          <Link to="#pricing" className="text-sm text-muted-foreground hover:text-foreground nav-link">Pricing</Link>
          <Link to="#testimonials" className="text-sm text-muted-foreground hover:text-foreground nav-link">Testimonials</Link>
          <Link to="#about" className="text-sm text-muted-foreground hover:text-foreground nav-link">About</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="whitespace-nowrap hover:border-primary hover:text-primary transition-colors duration-300"
          >
            Login
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate("/auth?tab=signup")}
            className="whitespace-nowrap bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity duration-300"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
