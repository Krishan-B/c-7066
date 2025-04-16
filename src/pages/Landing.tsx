
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  TrendingUp, 
  BarChart4, 
  Zap, 
  Globe, 
  Users, 
  Star, 
  ChevronRight 
} from "lucide-react";

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-secondary sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center">
            <LineChart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold ml-2">TradePro</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link to="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</Link>
            <Link to="#about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 container">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Trade Smarter<br />
              <span className="text-primary">Invest Wiser</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Access global markets with our advanced multi-asset trading platform. 
              Trade stocks, crypto, forex, and more with institutional-grade tools.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/auth?tab=signup">
                <Button size="lg">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="#features">
                <Button variant="outline" size="lg">Explore Features</Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg h-[400px] bg-secondary/20 rounded-lg overflow-hidden">
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
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/5">
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
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No hidden fees. Competitive rates that scale with your trading activity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard 
            title="Basic"
            price="$0"
            description="For beginners exploring the markets"
            features={[
              "Standard market access",
              "Basic charting tools",
              "Market research",
              "5 watchlists"
            ]}
            ctaText="Start Free"
          />
          <PricingCard 
            title="Pro"
            price="$29"
            description="For active traders seeking an edge"
            features={[
              "All Basic features",
              "Advanced charts and indicators",
              "Priority execution",
              "Unlimited watchlists",
              "API access"
            ]}
            ctaText="Upgrade to Pro"
            highlighted={true}
          />
          <PricingCard 
            title="Enterprise"
            price="Custom"
            description="For institutions and professional traders"
            features={[
              "All Pro features",
              "Institutional liquidity",
              "Dedicated support team",
              "Custom integrations",
              "Advanced risk management"
            ]}
            ctaText="Contact Sales"
          />
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-secondary/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Traders Worldwide</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See what our community has to say about trading with TradePro
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard 
              quote="TradePro's platform has transformed how I trade. The interface is intuitive and the execution is lightning fast."
              author="Sarah K."
              role="Day Trader"
              rating={5}
            />
            <TestimonialCard 
              quote="As someone who trades multiple asset classes, having everything in one platform has been a game-changer for my strategy."
              author="Michael T."
              role="Portfolio Manager"
              rating={5}
            />
            <TestimonialCard 
              quote="The analytics and research tools are incredible. I make more informed decisions and my returns have improved significantly."
              author="David R."
              role="Swing Trader"
              rating={4}
            />
          </div>
          
          <div className="flex justify-center mt-16 gap-8">
            <TrustBadge text="128-bit SSL Encryption" />
            <TrustBadge text="Regulated & Compliant" />
            <TrustBadge text="24/7 Support" />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 container">
        <div className="bg-primary/10 rounded-lg p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-lg mb-8 max-w-lg mx-auto">
            Join thousands of traders using TradePro to access global markets and reach their financial goals.
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="px-8">
              Create Your Free Account
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto bg-secondary/10 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Market Research</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Disclosures</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <LineChart className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold ml-2">TradePro</span>
              <span className="text-sm text-muted-foreground ml-4">© 2025 TradePro. All rights reserved.</span>
            </div>
            <div className="flex gap-4">
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-background border border-secondary/20 p-6 rounded-lg hover:border-primary/30 transition-all">
      <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

// Pricing Card Component
const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  ctaText, 
  highlighted = false 
}: { 
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
}) => {
  return (
    <div className={`
      border rounded-lg p-6 flex flex-col
      ${highlighted 
        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
        : 'border-secondary/20'
      }
    `}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-4 w-4 text-success mr-2" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        variant={highlighted ? "default" : "outline"} 
        className="w-full"
      >
        {ctaText}
      </Button>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ 
  quote, 
  author, 
  role, 
  rating 
}: { 
  quote: string;
  author: string;
  role: string;
  rating: number;
}) => {
  return (
    <div className="bg-background border border-secondary/20 p-6 rounded-lg">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} 
          />
        ))}
      </div>
      <blockquote className="mb-4">
        <p className="italic">{`"${quote}"`}</p>
      </blockquote>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
};

// Trust Badge Component
const TrustBadge = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center text-sm">
      <Shield className="h-4 w-4 text-success mr-2" />
      <span>{text}</span>
    </div>
  );
};

// Missing imports
import { LineChart, Check, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";

export default Landing;
