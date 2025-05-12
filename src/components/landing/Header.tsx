
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-secondary sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <LineChart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold ml-2">TradePro</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="whitespace-nowrap"
          >
            Login
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate("/auth?tab=signup")}
            className="whitespace-nowrap"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
