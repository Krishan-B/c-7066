import FeatureCard from './FeatureCard';
import { Shield, TrendingUp, BarChart4, Zap, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Platform Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            TradePro offers a comprehensive suite of tools for traders of all experience levels
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Enterprise Security"
            description="Bank-grade encryption and security protocols to keep your assets and data safe"
            delay={0.1}
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Real-Time Analytics"
            description="Live price updates and advanced charting tools to make informed decisions"
            delay={0.2}
          />
          <FeatureCard
            icon={<BarChart4 className="h-6 w-6" />}
            title="Multi-Asset Platform"
            description="Trade stocks, crypto, forex, commodities, and indices all from one account"
            delay={0.3}
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Fast Execution"
            description="Lightning-fast order execution with minimal slippage across all markets"
            delay={0.4}
          />
          <FeatureCard
            icon={<Globe className="h-6 w-6" />}
            title="Global Access"
            description="Access markets worldwide with 24/7 trading on selected assets and instruments"
            delay={0.5}
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Community Insights"
            description="Learn from other traders and follow market sentiment with social features"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
