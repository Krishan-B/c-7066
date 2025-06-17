import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ChevronRight, LineChart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@/components/theme/use-theme';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className="container overflow-hidden py-10 md:py-16">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
        <motion.div
          className="flex-1 space-y-6 md:space-y-8"
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
        >
          <h1 className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Trade <span className="text-primary">Smarter</span>
            <br />
            Invest <span className="text-primary">Wiser</span>
          </h1>

          <p className="max-w-lg text-base text-muted-foreground md:text-lg">
            Access global markets with our advanced multi-asset trading platform. Trade stocks,
            crypto, forex, and more with institutional-grade tools.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 md:gap-4 md:pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth?tab=signup')}
              className="whitespace-nowrap bg-primary transition-all duration-300 hover:opacity-90"
            >
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
              className="transition-all duration-300 hover:border-primary hover:text-primary"
            >
              Explore Features
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-2 text-muted-foreground">
            <span className="flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-1 text-sm">
              <TrendingUp className="h-4 w-4 text-success" /> 10k+ Users
            </span>
            <span className="flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-1 text-sm">
              <BarChart3 className="h-4 w-4 text-success" /> 98% Uptime
            </span>
            <span className="flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-1 text-sm">
              <LineChart className="h-4 w-4 text-success" /> Real-time Data
            </span>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex w-full flex-1 justify-center md:mt-0"
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.4,
          }}
        >
          <div
            className={`relative h-[240px] w-full max-w-lg overflow-hidden rounded-lg md:h-[400px] ${theme === 'dark' ? 'shadow-[0_0_30px_rgba(255,255,255,0.15)]' : 'shadow-lg'}`}
          >
            <div
              className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-white/20 to-primary/10' : 'bg-gradient-to-br from-primary/10 to-background/0'}`}
            ></div>
            <img
              src={theme === 'dark' ? '/trading-dashboard-white.svg' : '/trading-dashboard.svg'}
              alt="Trading Dashboard"
              className={`absolute inset-0 h-full w-full object-cover ${theme === 'dark' ? 'brightness-100 contrast-100' : 'contrast-105 brightness-110'}`}
              onError={(e) => {
                e.currentTarget.src =
                  'https://placehold.co/600x400/333333/8989DE?text=Trading+Dashboard';
              }}
            />

            <motion.div
              className={`absolute right-4 top-4 max-w-[180px] rounded-lg p-3 shadow-lg ${theme === 'dark' ? 'border border-white/20 bg-white/10 backdrop-blur-md' : 'bg-card'}`}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.8,
                duration: 0.4,
              }}
            >
              <div className="mb-1 text-xs text-primary">Total P&L</div>
              <div className="mb-1 text-xl font-bold">$89,000</div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="mr-1 h-3 w-3" /> 8.5% Up from yesterday
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
