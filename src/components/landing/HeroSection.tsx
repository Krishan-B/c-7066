
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight, BarChart3, LineChart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 md:py-24 container overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
        <motion.div 
          className="flex-1 space-y-6 md:space-y-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex items-center px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
            <span className="animate-pulse-subtle">●</span>
            <span className="ml-2">Trading made simple - Start today</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Trade <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Smarter</span>
            <br />
            Invest <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Wiser</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-lg">
            Access global markets with our advanced multi-asset trading platform. 
            Trade stocks, crypto, forex, and more with institutional-grade tools.
          </p>
          
          <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?tab=signup")}
              className="whitespace-nowrap bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-300"
            >
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:border-primary hover:text-primary transition-all duration-300"
            >
              Explore Features
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground pt-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-secondary/40 rounded-full text-sm">
              <TrendingUp className="h-4 w-4 text-success" /> 10k+ Users
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-secondary/40 rounded-full text-sm">
              <BarChart3 className="h-4 w-4 text-success" /> 98% Uptime
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-secondary/40 rounded-full text-sm">
              <LineChart className="h-4 w-4 text-success" /> Real-time Data
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1 flex justify-center w-full mt-8 md:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="relative w-full max-w-lg h-[240px] md:h-[400px] rounded-lg overflow-hidden glass-effect">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/0"></div>
            <img 
              src="/trading-dashboard.svg" 
              alt="Trading Dashboard" 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400/141413/8989DE?text=Trading+Dashboard';
              }}
            />
            
            <motion.div 
              className="absolute top-4 right-4 bg-card p-3 rounded-lg shadow-lg max-w-[180px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <div className="text-xs text-muted-foreground mb-1">Total Sales</div>
              <div className="text-xl font-bold mb-1">$89,000</div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" /> 8.5% Up from yesterday
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
