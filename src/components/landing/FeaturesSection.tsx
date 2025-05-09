
import React from "react";
import FeatureCard from "./FeatureCard";
import { Shield, TrendingUp, BarChart4, Zap, Globe, Users } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-20 bg-secondary/5">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            TradePro offers a comprehensive suite of tools for traders of all experience levels
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield className="h-6 w-6" />}
            title="Enterprise Security"
            description="Bank-grade encryption and security protocols to keep your assets and data safe"
          />
          <FeatureCard 
            icon={<TrendingUp className="h-6 w-6" />}
            title="Real-Time Analytics"
            description="Live price updates and advanced charting tools to make informed decisions"
          />
          <FeatureCard 
            icon={<BarChart4 className="h-6 w-6" />}
            title="Multi-Asset Platform"
            description="Trade stocks, crypto, forex, commodities, and indices all from one account"
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="Fast Execution"
            description="Lightning-fast order execution with minimal slippage across all markets"
          />
          <FeatureCard 
            icon={<Globe className="h-6 w-6" />}
            title="Global Access"
            description="Access markets worldwide with 24/7 trading on selected assets and instruments"
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6" />}
            title="Community Insights"
            description="Learn from other traders and follow market sentiment with social features"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
