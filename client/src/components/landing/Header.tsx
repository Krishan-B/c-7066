import { motion } from 'framer-motion';
import { LineChart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Button } from '@/components/ui/button';

const Header = () => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-secondary/40 bg-background shadow-sm"
    >
      <div className="container flex items-center justify-between py-3">
        <button
          className="flex cursor-pointer items-center rounded-sm border-none bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => navigate('/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/');
            }
          }}
          aria-label="Navigate to home page"
          type="button"
        >
          <LineChart className="h-8 w-8 text-primary" />
          <h1 className="ml-2 text-2xl font-bold text-foreground">TradePro</h1>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="#features"
            className="nav-link text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </Link>
          <Link
            to="#pricing"
            className="nav-link text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            to="#testimonials"
            className="nav-link text-sm text-muted-foreground hover:text-foreground"
          >
            Testimonials
          </Link>
          <Link
            to="#about"
            className="nav-link text-sm text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="whitespace-nowrap transition-colors duration-300 hover:border-primary hover:text-primary"
          >
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/auth?tab=signup')}
            className="whitespace-nowrap bg-primary transition-opacity duration-300 hover:opacity-90"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
