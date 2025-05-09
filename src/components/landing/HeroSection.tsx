
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 md:py-20 container">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="flex-1 space-y-5 md:space-y-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Trade Smarter<br />
            <span className="text-primary">Invest Wiser</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md">
            Access global markets with our advanced multi-asset trading platform. 
            Trade stocks, crypto, forex, and more with institutional-grade tools.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?tab=signup")}
              className="whitespace-nowrap"
            >
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="#features">
              <Button variant="outline" size="lg">Explore Features</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center w-full mt-8 md:mt-0">
          <div className="relative w-full max-w-lg h-[240px] md:h-[400px] bg-secondary/20 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(137,137,222,0.15),rgba(26,31,44,0))]"></div>
            <img 
              src="/trading-dashboard.svg" 
              alt="Trading Dashboard" 
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400/141413/8989DE?text=Trading+Dashboard';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
