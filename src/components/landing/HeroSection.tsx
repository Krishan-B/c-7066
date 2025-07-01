import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ArrowRight,
  BarChart3,
  LineChart,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { ErrorHandler } from "@/services/errorHandling";

const HeroSection = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    ErrorHandler.handleError({
      code: "data_fetch_error",
      message: "Failed to load hero image",
      details: { src: e.currentTarget.src },
      retryable: true,
    });
    setImageLoaded(false);
  };

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
            Trade <span className="text-primary">Smarter</span>
            <br />
            Invest <span className="text-primary">Wiser</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg">
            Access global markets with our advanced multi-asset trading
            platform. Trade stocks, crypto, forex, and more with
            institutional-grade tools.
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
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
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

        {imageLoaded && (
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <img
              src="/trading-dashboard.svg"
              alt="Trading Dashboard"
              className="w-full h-auto"
              onError={handleImageError}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
